package com.packora.backend.dto.packaging;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

/**
 * Request body for creating or updating a Packaging configuration.
 */
@Data
public class PackagingRequest {

    @NotBlank(message = "Type is required")
    private String type;

    private String material;

    private String size;

    private String color;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private Double price;

    /** Optional — link to an existing Design */
    private Long designId;

    /** Optional — the packaging partner who manages this packaging */
    private Long partnerId;
}
