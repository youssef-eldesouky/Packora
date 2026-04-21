package com.packora.backend.dto.order;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * A single line-item from the frontend shopping cart.
 *
 * Maps directly to what CartContext holds:
 *   { productId, quantity, size, material, price (unitPrice) }
 */
@Data
public class CartItemRequest {

    @NotNull(message = "productId is required")
    private Long productId;

    @NotNull(message = "quantity is required")
    @Min(value = 1, message = "quantity must be at least 1")
    private Integer quantity;

    /**
     * Unit price as the frontend knows it at checkout time.
     * Validated against the database price in the service layer
     * as a basic sanity check.
     */
    @NotNull(message = "unitPrice is required")
    @DecimalMin(value = "0.01", message = "unitPrice must be greater than 0")
    private Double unitPrice;

    // Optional variant selections
    private String size;

    private String material;
}
