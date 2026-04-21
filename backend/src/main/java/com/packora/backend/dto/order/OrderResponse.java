package com.packora.backend.dto.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Full response envelope for an Order.
 *
 * Returned by all Order endpoints — place, get, update status, cancel.
 * Contains a flat summary of the placing user plus all line-items.
 *
 * All monetary values are in the same currency unit as the Product prices.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private Long id;

    // Status as a string so the frontend can compare directly against
    // the mock-data status values ("pending", "processing", etc.)
    private String status;

    private Double totalAmount;

    private LocalDateTime orderDate;
    private LocalDateTime updatedAt;

    private String shippingAddress;

    // Placing user info
    private Long userId;
    private String userEmail;
    private String userName;       // username field from User entity
    private String companyName;    // business name (nullable)

    // Line-items
    private List<OrderItemResponse> items;

    // Convenience counts
    private int itemCount;         // number of distinct items
    private int totalQuantity;     // sum of all item quantities
}
