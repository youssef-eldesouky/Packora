package com.packora.backend.dto.packaging;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

/**
 * Request body for calculating a packaging quote.
 * Dimensions are in centimeters, quantity in units.
 */
@Data
public class QuoteRequest {

    @NotBlank(message = "Material is required")
    private String material;

    @NotNull(message = "Width is required")
    @Positive(message = "Width must be positive")
    private Double width;

    @NotNull(message = "Height is required")
    @Positive(message = "Height must be positive")
    private Double height;

    @NotNull(message = "Length is required")
    @Positive(message = "Length must be positive")
    private Double length;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be at least 1")
    private Integer quantity;

    /** Optional — custom color adds a surcharge */
    private String color;

    /** Optional — packaging type for context */
    private String type;
}
