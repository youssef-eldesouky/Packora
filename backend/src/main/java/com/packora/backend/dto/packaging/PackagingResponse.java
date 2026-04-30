package com.packora.backend.dto.packaging;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Response DTO for Packaging — avoids exposing lazy-loaded JPA associations.
 */
@Data
@Builder
public class PackagingResponse {

    private Long id;
    private String type;
    private String material;
    private String size;
    private String color;
    private Double price;
    private Long designId;
    private Long partnerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
