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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Implements the bulk order placement flow.
 *
 * Strategy:
 *  1. Expand all cart items by quantity into a flat "slot" list.
 *     e.g. [{productA, qty=2}, {productB, qty=1}] → [productA, productA, productB]
 *  2. Validate that slot count == recipient count (mirrors the frontend guard).
 *  3. Assign slot[i] → recipient[i], creating one Order per recipient with qty=1.
 *  4. All orders share a bulkGroupId UUID for post-payment status sync.
 *  5. Total amount = sum of all individual order totals (with 8% tax each).
 *
 * The entire operation runs in a single @Transactional — if any order fails
 * (e.g. product out of stock mid-way), ALL orders are rolled back atomically.
 */
@Service
public class BulkOrderServiceImpl implements BulkOrderService {

    private static final Logger log = LoggerFactory.getLogger(BulkOrderServiceImpl.class);

    private final UserRepository    userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository   orderRepository;

    public BulkOrderServiceImpl(UserRepository userRepository,
                                 ProductRepository productRepository,
                                 OrderRepository orderRepository) {
        this.userRepository    = userRepository;
        this.productRepository = productRepository;
        this.orderRepository   = orderRepository;
    }

    @Override
    @Transactional
    public BulkOrderResponse placeBulkOrder(BulkOrderRequest request, Long userId) {
        log.info("[BulkOrderService] Placing bulk order for userId={}, recipients={}",
                userId, request.getRecipients().size());

        // 1. Validate user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // 2. Expand cart items into a flat slot list (one slot = one box for one recipient)
        List<CartItemRequest> slots = expandItemsToSlots(request.getItems());

        // 3. Validate slot count matches recipient count
        int recipientCount = request.getRecipients().size();
        if (slots.size() != recipientCount) {
            throw new IllegalArgumentException(
                    "Mismatch: total cart quantity (" + slots.size() + ") must equal " +
                    "recipient count (" + recipientCount + "). " +
                    "Each recipient receives exactly 1 box.");
        }

        // 4. Generate a shared group ID for this bulk session
        String bulkGroupId = UUID.randomUUID().toString();
        log.info("[BulkOrderService] Bulk session bulkGroupId={}", bulkGroupId);

        // 5. Build the sender context string (prepended to each recipient's address)
        String senderContext = buildSenderContext(request);

        // 6. Create one order per recipient
        List<Long> orderIds = new ArrayList<>();
        double grandTotal = 0.0;

        for (int i = 0; i < recipientCount; i++) {
            BulkRecipientRequest recipient = request.getRecipients().get(i);
            CartItemRequest slot           = slots.get(i);

            // Build a single-item PlaceOrderRequest for this recipient
            CartItemRequest singleItem = new CartItemRequest();
            singleItem.setProductId(slot.getProductId());
            singleItem.setQuantity(1);
            singleItem.setUnitPrice(slot.getUnitPrice());
            singleItem.setSize(slot.getSize());
            singleItem.setMaterial(slot.getMaterial());

            // Validate product and deduct stock
            OrderItem orderItem = buildAndDeductOrderItem(singleItem);

            // Compute per-order total (with 8% tax, consistent with OrderServiceImpl)
            double lineTotal  = orderItem.getUnitPrice() * 1;
            double orderTotal = Math.round(lineTotal * 1.08 * 100.0) / 100.0;

            // Build the recipient shipping address string
            String shippingAddress = buildRecipientAddress(recipient, senderContext);

            // Persist the order
            Order order = new Order();
            order.setUser(user);
            order.setStatus(OrderStatus.PENDING);
            order.setTotalAmount(orderTotal);
            order.setShippingAddress(shippingAddress);
            order.setBulkGroupId(bulkGroupId);

            orderItem.setOrder(order);
            order.setOrderItems(List.of(orderItem));

            Order saved = orderRepository.save(order);
            orderIds.add(saved.getId());
            grandTotal += orderTotal;

            log.info("[BulkOrderService] Created order id={} for recipient='{}', total={}",
                    saved.getId(), recipient.getCustomerName(), orderTotal);
        }

        log.info("[BulkOrderService] Bulk session complete — {} orders created, grandTotal={}",
                recipientCount, grandTotal);

        return BulkOrderResponse.builder()
                .primaryOrderId(orderIds.get(0))
                .totalAmount(Math.round(grandTotal * 100.0) / 100.0)
                .bulkGroupId(bulkGroupId)
                .recipientCount(recipientCount)
                .orderIds(orderIds)
                .build();
    }

    // ── Private Helpers ──────────────────────────────────────────────────────

    /**
     * Expands cart items by their quantity into a flat list of single-unit slots.
     *
     * Example:
     *   Input:  [{productId=1, qty=2, price=10}, {productId=2, qty=1, price=20}]
     *   Output: [{productId=1, qty=1, price=10},
     *            {productId=1, qty=1, price=10},
     *            {productId=2, qty=1, price=20}]
     */
    private List<CartItemRequest> expandItemsToSlots(List<CartItemRequest> items) {
        List<CartItemRequest> slots = new ArrayList<>();
        for (CartItemRequest item : items) {
            int qty = item.getQuantity() != null ? item.getQuantity() : 1;
            for (int i = 0; i < qty; i++) {
                CartItemRequest slot = new CartItemRequest();
                slot.setProductId(item.getProductId());
                slot.setQuantity(1);
                slot.setUnitPrice(item.getUnitPrice());
                slot.setSize(item.getSize());
                slot.setMaterial(item.getMaterial());
                slots.add(slot);
            }
        }
        return slots;
    }

    /**
     * Validates the product is in stock, deducts 1 unit, and returns the built OrderItem.
     * Mirrors the logic in OrderServiceImpl.buildOrderItem + the stock-deduction loop.
     */
    private OrderItem buildAndDeductOrderItem(CartItemRequest cartItem) {
        Product product = productRepository.findById(cartItem.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", cartItem.getProductId()));

        if (product.getInStock() == null || !product.getInStock()) {
            throw new IllegalStateException(
                    "Product '" + product.getName() + "' (id=" + product.getId() + ") is out of stock.");
        }

        int available = product.getStock() != null ? product.getStock() : 0;
        if (available < 1) {
            throw new IllegalStateException(
                    "No stock remaining for product '" + product.getName() + "' (id=" + product.getId() + ").");
        }

        // Deduct 1 unit
        int newStock = available - 1;
        product.setStock(newStock);
        if (newStock == 0) {
            product.setInStock(false);
        }
        productRepository.save(product);

        return OrderItem.builder()
                .product(product)
                .quantity(1)
                .unitPrice(cartItem.getUnitPrice())
                .selectedSize(cartItem.getSize())
                .selectedMaterial(cartItem.getMaterial())
                .build();
    }

    /**
     * Formats the warehouse/sender info into a compact context string
     * appended to each recipient's address for record-keeping.
     */
    private String buildSenderContext(BulkOrderRequest request) {
        List<String> parts = new ArrayList<>();
        if (request.getWarehouseName() != null && !request.getWarehouseName().isBlank())
            parts.add(request.getWarehouseName());
        if (request.getAddressLine() != null && !request.getAddressLine().isBlank())
            parts.add(request.getAddressLine());
        if (request.getCity() != null && !request.getCity().isBlank())
            parts.add(request.getCity());
        if (request.getPostalCode() != null && !request.getPostalCode().isBlank())
            parts.add(request.getPostalCode());
        if (request.getContactNumber() != null && !request.getContactNumber().isBlank())
            parts.add(request.getContactNumber());
        return "Sender: " + String.join(", ", parts);
    }

    /**
     * Formats a single recipient's shipping address string.
     * Format: "CustomerName, Phone, Address, City[, Notes] | SenderContext"
     */
    private String buildRecipientAddress(BulkRecipientRequest recipient, String senderContext) {
        List<String> parts = new ArrayList<>();
        parts.add(recipient.getCustomerName());
        parts.add(recipient.getPhone());
        parts.add(recipient.getAddress());
        parts.add(recipient.getCity());
        if (recipient.getNotes() != null && !recipient.getNotes().isBlank()) {
            parts.add(recipient.getNotes());
        }
        return String.join(", ", parts) + " | " + senderContext;
    }
}
