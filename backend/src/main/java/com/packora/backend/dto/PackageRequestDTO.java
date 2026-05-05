package com.packora.backend.dto;

import lombok.Data;

/**
 * @deprecated Use {@link com.packora.backend.dto.packaging.QuoteRequest} instead.
 */
@Deprecated
@Data
public class PackageRequestDTO {
    private String material;
    private Double width;
    private Double height;
    private Integer quantity;
}
