package com.packora.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * Base user entity using Single Table Inheritance.
 * All user types (Admin, BusinessOwner, SupportStaff, PartnerPackaging, PartnerShipping)
 * are stored in a single "users" table, differentiated by the "role" discriminator column.
 */
@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "role", discriminatorType = DiscriminatorType.STRING)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public abstract class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String username;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank
    @Column(nullable = false)
    private String password;

    private String phone;

    // ── Shared optional fields used by multiple subtypes ──
    // BusinessOwner, PartnerPackaging, PartnerShipping all have a company name
    private String companyName;

    // PartnerPackaging and PartnerShipping both have a service type
    private String serviceType;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // --- UserDetails methods ---

    @Transient
    public String getRole() {
        DiscriminatorValue val = this.getClass().getAnnotation(DiscriminatorValue.class);
        return val != null ? val.value() : null;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String roleStr = getRole();
        if (roleStr != null) {
            return List.of(new SimpleGrantedAuthority("ROLE_" + roleStr));
        }
        return List.of();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
