package com.packora.backend.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Support Staff — monitors order progress and responds to customer queries.
 */
@Entity
@DiscriminatorValue("SUPPORT_STAFF")
@Getter
@Setter
@NoArgsConstructor
public class SupportStaff extends User {

    private String shiftTime;
}
