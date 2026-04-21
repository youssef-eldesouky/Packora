package com.packora.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

/**
 * OrderItem — represents a single line-item in a catalog-based order.
 *
 * Holds the product reference, the chosen variant options (size, material),
 * the quantity ordered, and the unit price at the time of purchase.
 *
 * NOTE: This is distinct from {@link OrderPackaging}, which handles custom
 * packaging configurations created by Packaging Partners. OrderItem is for
 * standard catalog products (boxes, mailers, etc.) added through the cart.
 */
@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The parent order
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private Order order;

    // The catalog product that was ordered
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    /**
     * Unit price captured at order time.
     * Stored independently so future product price changes
     * don't retroactively alter historical orders.
     */
    @Column(nullable = false)
    private Double unitPrice;

    // Variant selections made by the customer at checkout
    private String selectedSize;

    private String selectedMaterial;
}
