package com.packora.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Catalog product entity — represents browsable packaging products
 * (boxes, mailers, bubble wrap, etc.) that customers can order.
 *
 * Uses @ElementCollection for sizes and materials, which creates
 * junction tables: product_sizes and product_materials.
 */
@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double price;

    private String imageUrl;

    private String category;

    private Integer minOrder;

    @Column(nullable = false)
    private Boolean inStock = true;

    // ── Junction table: product_sizes ──
    @ElementCollection
    @CollectionTable(
        name = "product_sizes",
        joinColumns = @JoinColumn(name = "product_id")
    )
    @Column(name = "size")
    private List<String> sizes = new ArrayList<>();

    // ── Junction table: product_materials ──
    @ElementCollection
    @CollectionTable(
        name = "product_materials",
        joinColumns = @JoinColumn(name = "product_id")
    )
    @Column(name = "material")
    private List<String> materials = new ArrayList<>();

    @org.hibernate.annotations.CreationTimestamp
    @Column(updatable = false)
    private java.time.LocalDateTime createdAt;

    @org.hibernate.annotations.UpdateTimestamp
    private java.time.LocalDateTime updatedAt;
}
