package com.packora.backend.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Admin user — manages users, orders, pricing, and promotional content.
 */
@Entity
@DiscriminatorValue("ADMIN")
@Getter
@Setter
@NoArgsConstructor
public class Admin extends User {

    private String permissionsLevel;
}
