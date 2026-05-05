package com.packora.backend.dto.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

/**
 * Request body for creating or updating a Product.
 */
@Data
public class ProductRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private Double price;

    private String imageUrl;

    private String category;

    private Integer minOrder;

    private Boolean inStock = true;

    private List<String> sizes;

    private List<String> materials;
}
