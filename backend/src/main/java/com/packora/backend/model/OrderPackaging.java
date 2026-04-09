package com.packora.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

/**
 * Join entity for the many-to-many relationship between Order and Packaging.
 * Includes a quantity field — this is why we use a join entity instead of @ManyToMany.
 */
@Entity
@Table(name = "order_packaging")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderPackaging {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The order
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private Order order;

    // The packaging item
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "packaging_id", nullable = false)
    @JsonIgnore
    private Packaging packaging;

    @Column(nullable = false)
    private Integer quantity;
}
