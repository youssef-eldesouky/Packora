package com.packora.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.packora.backend.model.enums.ShipmentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Shipment entity — represents the shipping/delivery details for an order.
 * One-to-one with Order. Handled by a Shipping Partner.
 */
@Entity
@Table(name = "shipments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String trackingNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentStatus status = ShipmentStatus.PREPARING;

    private LocalDate deliveryDate;

    // The order this shipment belongs to (one-to-one)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    @JsonIgnore
    private Order order;

    // The shipping partner handling this shipment
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipping_partner_id")
    @JsonIgnore
    private User shippingPartner;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
