package com.packora.backend.service;

import com.packora.backend.dto.cart.AddToCartRequest;
import com.packora.backend.dto.cart.CartItemResponse;
import com.packora.backend.dto.cart.CartResponse;
import com.packora.backend.exception.ResourceNotFoundException;
import com.packora.backend.model.Cart;
import com.packora.backend.model.CartItem;
import com.packora.backend.model.CustomBoxConfig;
import com.packora.backend.model.Product;
import com.packora.backend.model.User;
import com.packora.backend.repository.CartItemRepository;
import com.packora.backend.repository.CartRepository;
import com.packora.backend.repository.CustomBoxConfigRepository;
import com.packora.backend.repository.ProductRepository;
import com.packora.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.packora.backend.dto.packaging.QuoteRequest;
import com.packora.backend.dto.packaging.QuoteResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartServiceImpl implements CartService {

    private static final Logger log = LoggerFactory.getLogger(CartServiceImpl.class);

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CustomBoxConfigRepository customBoxConfigRepository;
    private final PackagingService packagingService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public CartServiceImpl(CartRepository cartRepository, 
                           CartItemRepository cartItemRepository, 
                           ProductRepository productRepository, 
                           UserRepository userRepository,
                           CustomBoxConfigRepository customBoxConfigRepository,
                           PackagingService packagingService) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.customBoxConfigRepository = customBoxConfigRepository;
        this.packagingService = packagingService;
    }

    @Override
    @Transactional
    public CartResponse getCartForUser(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return mapToResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addItemToCart(Long userId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        // Check if the item already exists in the cart (same product, size, and material)
        Optional<CartItem> existingItemOpt = cart.getCartItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()) &&
                        ((item.getSelectedSize() == null && request.getSelectedSize() == null) || 
                         (item.getSelectedSize() != null && item.getSelectedSize().equals(request.getSelectedSize()))) &&
                        ((item.getSelectedMaterial() == null && request.getSelectedMaterial() == null) || 
                         (item.getSelectedMaterial() != null && item.getSelectedMaterial().equals(request.getSelectedMaterial()))))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            // Update quantity
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
        } else {
            // Add new item
            CartItem newItem = new CartItem();
            newItem.setProduct(product);
            newItem.setQuantity(request.getQuantity());
            newItem.setSelectedSize(request.getSelectedSize());
            newItem.setSelectedMaterial(request.getSelectedMaterial());

            // Link custom box configuration if provided
            if (request.getCustomBoxConfigId() != null) {
                CustomBoxConfig config = customBoxConfigRepository.findById(request.getCustomBoxConfigId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "CustomBoxConfig not found with id: " + request.getCustomBoxConfigId()));
                newItem.setCustomBoxConfig(config);
            }

            cart.addCartItem(newItem);
        }

        cartRepository.save(cart);
        return mapToResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse updateItemQuantity(Long userId, Long itemId, int quantity) {
        if (quantity < 1) {
            throw new IllegalArgumentException("Quantity must be at least 1");
        }

        Cart cart = getOrCreateCart(userId);
        CartItem cartItem = cartItemRepository.findById(itemId).orElse(null);
        if (cartItem == null) {
            log.warn("Attempted to update non-existent CartItem id={}", itemId);
            return mapToResponse(cart);
        }

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new IllegalArgumentException("Item does not belong to the user's cart");
        }

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);

        return mapToResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse removeItemFromCart(Long userId, Long itemId) {
        Cart cart = getOrCreateCart(userId);
        // Try to find the item; if it does not exist, just return the current cart state.
        java.util.Optional<CartItem> optItem = cartItemRepository.findById(itemId);
        if (optItem.isEmpty()) {
            log.warn("Attempted to delete non‑existent CartItem id={}", itemId);
            return mapToResponse(cart);
        }
        CartItem cartItem = optItem.get();
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new IllegalArgumentException("Item does not belong to the user's cart");
        }
        cart.removeCartItem(cartItem);
        cartRepository.save(cart);
        return mapToResponse(cart);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getCartItems().clear();
        cartRepository.save(cart);
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            Cart newCart = new Cart();
            newCart.setUser(user);
            return cartRepository.save(newCart);
        });
    }

    private CartResponse mapToResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getCartItems().stream()
                .map(item -> {
                    Double unitPrice = item.getProduct().getPrice();
                    if (item.getCustomBoxConfig() != null) {
                        try {
                            unitPrice = calculateCustomBoxUnitPrice(item);
                        } catch (Exception e) {
                            log.error("Fallback to default catalog price for cart item id={}", item.getId(), e);
                        }
                    }
                    Double totalItemPrice = unitPrice * item.getQuantity();
                    return new CartItemResponse(
                            item.getId(),
                            item.getProduct().getId(),
                            item.getProduct().getName(),
                            item.getProduct().getImageUrl(),
                            item.getQuantity(),
                            unitPrice,
                            item.getSelectedSize(),
                            item.getSelectedMaterial(),
                            totalItemPrice
                    );
                })
                .collect(Collectors.toList());

        Double totalPrice = itemResponses.stream()
                .mapToDouble(CartItemResponse::getTotalItemPrice)
                .sum();

        return new CartResponse(cart.getId(), itemResponses, totalPrice);
    }

    private Double calculateCustomBoxUnitPrice(CartItem item) {
        try {
            String json = item.getCustomBoxConfig().getConfigurationJson();
            JsonNode root = objectMapper.readTree(json);

            // Extract material from custom design, or fallback to selectedMaterial, or standard "corrugated"
            String material = "corrugated";
            if (root.has("material") && !root.get("material").asText().isEmpty()) {
                material = root.get("material").asText();
            } else if (item.getSelectedMaterial() != null && !item.getSelectedMaterial().isEmpty()) {
                material = item.getSelectedMaterial();
            }

            // Extract dimensions (length, width, height)
            double length = 15.0;
            double width = 20.0;
            double height = 30.0;
            if (root.has("boxDimensions")) {
                JsonNode dims = root.get("boxDimensions");
                if (dims.has("length") && dims.get("length").isNumber()) length = dims.get("length").asDouble();
                if (dims.has("width") && dims.get("width").isNumber()) width = dims.get("width").asDouble();
                if (dims.has("height") && dims.get("height").isNumber()) height = dims.get("height").asDouble();
            }

            // Construct quote request
            QuoteRequest quoteRequest = new QuoteRequest();
            quoteRequest.setMaterial(material);
            quoteRequest.setLength(length);
            quoteRequest.setWidth(width);
            quoteRequest.setHeight(height);
            quoteRequest.setQuantity(item.getQuantity());
            quoteRequest.setColor("natural"); // default color
            quoteRequest.setType("Box");

            QuoteResponse quote = packagingService.calculateQuote(quoteRequest);
            return quote.getUnitPrice();
        } catch (Exception e) {
            log.error("Failed to calculate custom box unit price for cart item id={}", item.getId(), e);
            return 0.0;
        }
    }
}
