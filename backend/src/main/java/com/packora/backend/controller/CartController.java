package com.packora.backend.controller;

import com.packora.backend.dto.cart.AddToCartRequest;
import com.packora.backend.dto.cart.CartResponse;
import com.packora.backend.security.services.UserDetailsImpl;
import com.packora.backend.service.CartService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private static final Logger log = LoggerFactory.getLogger(CartController.class);

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal UserDetailsImpl principal) {
        log.info("[CartController] GET /api/cart - userId={}", principal.getId());
        return ResponseEntity.ok(cartService.getCartForUser(principal.getId()));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItemToCart(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @Valid @RequestBody AddToCartRequest request) {
        log.info("[CartController] POST /api/cart/items - userId={}, productId={}", principal.getId(), request.getProductId());
        return ResponseEntity.ok(cartService.addItemToCart(principal.getId(), request));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> updateItemQuantity(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable Long itemId,
            @RequestParam int quantity) {
        log.info("[CartController] PUT /api/cart/items/{} - userId={}, quantity={}", itemId, principal.getId(), quantity);
        return ResponseEntity.ok(cartService.updateItemQuantity(principal.getId(), itemId, quantity));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> removeItemFromCart(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable Long itemId) {
        log.info("[CartController] DELETE /api/cart/items/{} - userId={}", itemId, principal.getId());
        return ResponseEntity.ok(cartService.removeItemFromCart(principal.getId(), itemId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserDetailsImpl principal) {
        log.info("[CartController] DELETE /api/cart - userId={}", principal.getId());
        cartService.clearCart(principal.getId());
        return ResponseEntity.noContent().build();
    }
}
