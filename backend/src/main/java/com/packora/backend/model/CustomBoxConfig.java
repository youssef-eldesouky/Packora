package com.packora.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * CustomBoxConfig entity — represents an end-user's saved 3D Box configuration.
 * Stores the editable JSON state of the 3D cube.
 */
@Entity
@Table(name = "custom_box_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomBoxConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The user who created this draft configuration
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    // The entire JSON state from the 3D-Box frontend (designs, dimensions, materials, etc)
    @Column(columnDefinition = "TEXT", nullable = false)
    private String configurationJson;

    // True if explicitly saved by user. False if silently generated during "Add to Cart"
    @Column(nullable = false)
    private boolean isSavedDraft = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
