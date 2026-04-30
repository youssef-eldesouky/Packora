package com.packora.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.packora.backend.model.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Order entity — represents a customer order for packaging products.
 * Placed by a BusinessOwner, contains payments, a shipment, and packaging items.
 *
 * Contains two types of line-items:
 *   1. {@link OrderItem}        — standard catalog products (boxes, mailers, etc.)
 *   2. {@link OrderPackaging}   — custom packaging configurations from partners
 */
@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime orderDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(nullable = false)
    private Double totalAmount;

    /**
     * Shipping address captured at checkout (free-text snapshot).
     * Stored on the order so it reflects the address used at time of purchase,
     * even if the user later updates their profile address.
     */
    @Column(columnDefinition = "TEXT")
    private String shippingAddress;

    // The user (BusinessOwner) who placed this order
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    // Payments for this order (supports partial payments / refunds)
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Payment> payments = new ArrayList<>();

    // Shipment for this order (one-to-one)
    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Shipment shipment;

    // Packaging items in this order (many-to-many via OrderPackaging join entity)
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<OrderPackaging> orderPackagings = new ArrayList<>();

    // Standard catalog line-items (added via the shopping cart)
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> orderItems = new ArrayList<>();

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
