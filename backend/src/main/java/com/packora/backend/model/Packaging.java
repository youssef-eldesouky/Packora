package com.packora.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Packaging entity — represents a custom packaging configuration
 * with type, material, size, color, and price.
 * Created/monitored by a Packaging Partner and linked to a Design.
 */
@Entity
@Table(name = "packagings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Packaging {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type;

    private String material;

    private String size;

    private String color;

    @Column(nullable = false)
    private Double price;

    // The design applied to this packaging
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "design_id")
    @JsonIgnore
    private Design design;

    // The packaging partner who monitors/manages this packaging
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id")
    @JsonIgnore
    private User partner;

    // Orders that include this packaging (via join entity)
    @OneToMany(mappedBy = "packaging", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<OrderPackaging> orderPackagings = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
