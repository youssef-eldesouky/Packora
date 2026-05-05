package com.packora.backend.dto.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * Request body for POST /api/orders — placing an order.
 *
 * Contains the user who is placing the order, the list of cart items,
 */
@Data
public class PlaceOrderRequest {
    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<CartItemRequest> items;

    /**
     * Free-text shipping address snapshot from the checkout form.
     * Format: "FullName, Company, Street, City, State ZIP, Phone"
     * Stored as-is on the order record for historical accuracy.
     */
    private String shippingAddress;
}
