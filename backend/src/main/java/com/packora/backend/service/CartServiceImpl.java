package com.packora.backend.service;

import com.packora.backend.dto.cart.AddToCartRequest;
import com.packora.backend.dto.cart.CartItemResponse;
import com.packora.backend.dto.cart.CartResponse;
import com.packora.backend.exception.ResourceNotFoundException;
import com.packora.backend.model.Cart;
import com.packora.backend.model.CartItem;
import com.packora.backend.model.Product;
import com.packora.backend.model.User;
import com.packora.backend.repository.CartItemRepository;
import com.packora.backend.repository.CartRepository;
import com.packora.backend.repository.ProductRepository;
import com.packora.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Autowired
    public CartServiceImpl(CartRepository cartRepository, 
                           CartItemRepository cartItemRepository, 
                           ProductRepository productRepository, 
                           UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
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
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem not found with id: " + itemId));

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
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem not found with id: " + itemId));

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
                    Double totalItemPrice = item.getProduct().getPrice() * item.getQuantity();
                    return new CartItemResponse(
                            item.getId(),
                            item.getProduct().getId(),
                            item.getProduct().getName(),
                            item.getProduct().getImageUrl(),
                            item.getQuantity(),
                            item.getProduct().getPrice(),
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
}
