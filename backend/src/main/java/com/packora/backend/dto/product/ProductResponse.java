package com.packora.backend.dto.product;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for Product.
 */
@Data
@Builder
public class ProductResponse {

    private Long id;
    private String name;
    private String description;
    private Double price;
    private String imageUrl;
    private String category;
    private Integer minOrder;
    private Boolean inStock;
    private List<String> sizes;
    private List<String> materials;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
