package com.packora.backend.dto;

import lombok.Data;

@Data
public class PackageRequestDTO {
    private String material;
    private Double width;
    private Double height;
    private Integer quantity;
}
