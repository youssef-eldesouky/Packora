package com.packora.backend.service;

import com.packora.backend.dto.cart.AddToCartRequest;
import com.packora.backend.dto.cart.CartResponse;

public interface CartService {
    CartResponse getCartForUser(Long userId);
    CartResponse addItemToCart(Long userId, AddToCartRequest request);
    CartResponse updateItemQuantity(Long userId, Long itemId, int quantity);
    CartResponse removeItemFromCart(Long userId, Long itemId);
    void clearCart(Long userId);
}
