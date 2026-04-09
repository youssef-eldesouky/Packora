package com.packora.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Packaging Partner — creates designs and monitors custom packaging production.
 * companyName and serviceType are inherited from User base class.
 */
@Entity
@DiscriminatorValue("PARTNER_PACKAGING")
@Getter
@Setter
@NoArgsConstructor
public class PartnerPackaging extends User {

    // A packaging partner can create many designs
    @OneToMany(mappedBy = "partner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Design> designs = new ArrayList<>();

    // A packaging partner monitors many packaging items
    @OneToMany(mappedBy = "partner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Packaging> packagings = new ArrayList<>();
}
