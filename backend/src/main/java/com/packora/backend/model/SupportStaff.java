package com.packora.backend.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

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

    // A support staff member can be assigned many tickets
    @OneToMany(mappedBy = "assignedStaff", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Ticket> assignedTickets = new ArrayList<>();
}
