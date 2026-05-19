package com.packora.backend.service;

import com.packora.backend.dto.order.*;
import com.packora.backend.exception.ResourceNotFoundException;
import com.packora.backend.model.Order;
import com.packora.backend.model.OrderItem;
import com.packora.backend.model.Product;
import com.packora.backend.model.User;
import com.packora.backend.model.enums.OrderStatus;
import com.packora.backend.repository.OrderRepository;
import com.packora.backend.repository.ProductRepository;
import com.packora.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Implementation of {@link OrderService}.
 *
 * All mutating methods run within a transaction.
 * Read-only methods use @Transactional(readOnly = true) so Hibernate
 * doesn't flush before every query, which is a performance win on lists.
 */
@Service
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderServiceImpl.class);

    /**
     * Statuses that permanently close an order.
     * Transitioning out of these is not allowed.
     */
    private static final Set<OrderStatus> TERMINAL_STATUSES =
            Set.of(OrderStatus.CANCELLED, OrderStatus.DELIVERED);

    /**
     * Only orders in these statuses can still be cancelled by the customer.
     */
    private static final Set<OrderStatus> CANCELLABLE_STATUSES =
            Set.of(OrderStatus.PENDING, OrderStatus.PROCESSING);

    private final OrderRepository    orderRepository;
    private final UserRepository     userRepository;
    private final ProductRepository  productRepository;
    private final ShipmentService    shipmentService;
    private final CartService        cartService;

    /**
     * @Lazy on ShipmentService breaks the potential circular dependency:
     *   OrderService → ShipmentService → OrderRepository → (no cycle back)
     * Spring resolves this cleanly at runtime via a proxy.
     */
    public OrderServiceImpl(OrderRepository orderRepository,
                            UserRepository userRepository,
                            ProductRepository productRepository,
                            @Lazy ShipmentService shipmentService,
                            CartService cartService) {
        this.orderRepository   = orderRepository;
        this.userRepository    = userRepository;
        this.productRepository = productRepository;
        this.shipmentService   = shipmentService;
        this.cartService       = cartService;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  Place Order
    // ══════════════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public OrderResponse placeOrder(PlaceOrderRequest request, Long userId) {
        log.info("[OrderService] Placing order for userId={}", userId);

        // 1. Validate user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // 2. Build OrderItems, validate each product, and compute total
        List<OrderItem> orderItems = request.getItems().stream()
                .map(cartItem -> buildOrderItem(cartItem))
                .collect(Collectors.toList());

        // Deduct stock for each item ordered
        for (OrderItem item : orderItems) {
            Product product = item.getProduct();
            int currentStock = product.getStock() != null ? product.getStock() : 0;
            int newStock = currentStock - item.getQuantity();
            if (newStock < 0) {
                throw new IllegalStateException("Not enough stock available for product '" + product.getName() + "'");
            }
            product.setStock(newStock);
            if (newStock == 0) {
                product.setInStock(false);
            }
            productRepository.save(product);
        }

        double total = orderItems.stream()
                .mapToDouble(item -> item.getUnitPrice() * item.getQuantity())
                .sum();

        // Apply 8% tax, matching the frontend calculation
        total = Math.round(total * 1.08 * 100.0) / 100.0;

        // 3. Create and persist the Order
        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setTotalAmount(total);
        order.setShippingAddress(request.getShippingAddress());

        // Link each OrderItem back to this Order
        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }
        order.setOrderItems(orderItems);

        Order saved = orderRepository.save(order);
        log.info("[OrderService] Order {} saved successfully. Total: {}", saved.getId(), saved.getTotalAmount());

        // Auto-create a Shipment for this order in the same transaction.
        // This ensures the Track page has a real shipment record (with a real
        // tracking number) from the moment the order is confirmed.
        try {
            shipmentService.createShipmentForOrder(saved.getId());
        } catch (Exception e) {
            // Log but do not fail the order — the order is primary, the shipment
            // can be manually created by an admin if something goes wrong here.
            log.error("[OrderService] Failed to auto-create shipment for order {}. Manual creation required. Error: {}",
                    saved.getId(), e.getMessage());
        }

        // Atomically clear the cart after the order is successfully placed.
        try {
            cartService.clearCart(userId);
            log.info("[OrderService] Cart cleared for userId={}", userId);
        } catch (Exception e) {
            log.warn("[OrderService] Failed to clear cart for userId={}, you may need to clear it manually. Error: {}", userId, e.getMessage());
        }

        return toOrderResponse(saved);
    }

    /**
     * Resolves a {@link CartItemRequest} to an {@link OrderItem}.
     * Validates that the product exists and is in stock.
     */
    private OrderItem buildOrderItem(CartItemRequest cartItem) {
        Product product = productRepository.findById(cartItem.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product", cartItem.getProductId()));

        if (product.getInStock() == null || !product.getInStock()) {
            throw new IllegalStateException(
                    "Product '" + product.getName() + "' (id=" + product.getId() + ") is currently out of stock.");
        }

        int availableStock = product.getStock() != null ? product.getStock() : 0;
        if (availableStock < cartItem.getQuantity()) {
            throw new IllegalStateException(
                    "Not enough stock available for product '" + product.getName() + "' (id=" + product.getId() + "). " +
                    "Available: " + availableStock + ", Requested: " + cartItem.getQuantity());
        }

        return OrderItem.builder()
                .product(product)
                .quantity(cartItem.getQuantity())
                .unitPrice(cartItem.getUnitPrice())
                .selectedSize(cartItem.getSize())
                .selectedMaterial(cartItem.getMaterial())
                .build();
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  Read Operations
    // ══════════════════════════════════════════════════════════════════════════

    @Override
    public OrderResponse getOrderById(Long orderId) {
        Order order = findOrderOrThrow(orderId);
        return toOrderResponse(order);
    }

    @Override
    public List<OrderResponse> getOrdersByUser(Long userId) {
        // Validate user exists first so we surface a 404 rather than an empty list
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", userId);
        }
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId)
                .stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Order::getOrderDate,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toOrderResponse)
                .collect(Collectors.toList());
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  Mutations
    // ══════════════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = findOrderOrThrow(orderId);

        // Guard: terminal orders cannot be moved to any other status
        if (TERMINAL_STATUSES.contains(order.getStatus())) {
            throw new IllegalStateException(
                    "Order " + orderId + " is already " + order.getStatus().name().toLowerCase()
                    + " and cannot be updated.");
        }

        log.info("[OrderService] Updating order {} status: {} -> {}",
                orderId, order.getStatus(), newStatus);

        order.setStatus(newStatus);
        return toOrderResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(Long orderId, Long userId) {
        Order order = findOrderOrThrow(orderId);

        // Ownership check: only the order's owner can cancel it
        if (!order.getUser().getId().equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You are not authorized to cancel this order.");
        }

        if (!CANCELLABLE_STATUSES.contains(order.getStatus())) {
            throw new IllegalStateException(
                    "Order " + orderId + " cannot be cancelled. Current status: "
                    + order.getStatus().name().toLowerCase()
                    + ". Only PENDING or PROCESSING orders can be cancelled.");
        }

        log.info("[OrderService] Cancelling order {} for userId={}", orderId, userId);
        order.setStatus(OrderStatus.CANCELLED);
        return toOrderResponse(orderRepository.save(order));
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  Mapping helpers
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Maps an {@link Order} entity to an {@link OrderResponse} DTO.
     * Deliberately avoids returning raw entity objects to prevent
     * LazyInitializationException and to decouple the API surface from
     * the persistence model.
     */
    private OrderResponse toOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getOrderItems().stream()
                .map(this::toOrderItemResponse)
                .collect(Collectors.toList());

        int totalQuantity = itemResponses.stream()
                .mapToInt(OrderItemResponse::getQuantity)
                .sum();

        User user = order.getUser();

        return OrderResponse.builder()
                .id(order.getId())
                .status(order.getStatus().name().toLowerCase())
                .totalAmount(order.getTotalAmount())
                .orderDate(order.getOrderDate())
                .updatedAt(order.getUpdatedAt())
                .shippingAddress(order.getShippingAddress())
                .userId(user.getId())
                .userEmail(user.getEmail())
                .userName(user.getUsername())
                .companyName(user.getCompanyName())
                .items(itemResponses)
                .itemCount(itemResponses.size())
                .totalQuantity(totalQuantity)
                .build();
    }

    private OrderItemResponse toOrderItemResponse(OrderItem item) {
        Double price = item.getUnitPrice() != null ? item.getUnitPrice() : 0.0;
        Integer qty = item.getQuantity() != null ? item.getQuantity() : 0;
        
        Long productId = null;
        String productName = "Unknown Product";
        String productImageUrl = null;

        try {
            if (item.getProduct() != null) {
                productId = item.getProduct().getId();
                productName = item.getProduct().getName();
                productImageUrl = item.getProduct().getImageUrl();
            }
        } catch (jakarta.persistence.EntityNotFoundException | org.hibernate.ObjectNotFoundException e) {
            // Product was deleted from the database or is missing
            productId = null;
            productName = "Unknown Product (Deleted)";
            productImageUrl = null;
        }

        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(productId)
                .productName(productName)
                .productImageUrl(productImageUrl)
                .quantity(qty)
                .unitPrice(price)
                .lineTotal(Math.round(price * qty * 100.0) / 100.0)
                .selectedSize(item.getSelectedSize())
                .selectedMaterial(item.getSelectedMaterial())
                .build();
    }

    /**
     * Centralised lookup so all methods share the same not-found behaviour.
     */
    private Order findOrderOrThrow(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
    }
}
