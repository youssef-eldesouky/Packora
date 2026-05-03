package com.packora.backend.dto.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response shape for a single line-item within an order.
 * Returned as part of {@link OrderResponse}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private Integer quantity;
    private Double unitPrice;
    private Double lineTotal;        // unitPrice * quantity
    private String selectedSize;
    private String selectedMaterial;
}
