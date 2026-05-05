package com.packora.backend.dto.packaging;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

/**
 * Response for a packaging quote calculation.
 * Includes unit price, total price, and a detailed cost breakdown.
 */
@Data
@Builder
public class QuoteResponse {

    private Double unitPrice;
    private Double totalPrice;
    private String currency;
    private Integer quantity;

    /**
     * Breakdown of how the price was calculated.
     * Example keys: "baseMaterialCost", "surfaceAreaMultiplier",
     *               "colorSurcharge", "volumeDiscount"
     */
    private Map<String, String> breakdown;
}
