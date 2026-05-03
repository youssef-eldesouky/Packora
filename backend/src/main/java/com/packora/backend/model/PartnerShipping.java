package com.packora.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Shipping Partner — handles shipment logistics and delivery.
 * companyName and serviceType are inherited from User base class.
 */
@Entity
@DiscriminatorValue("PARTNER_SHIPPING")
@Getter
@Setter
@NoArgsConstructor
public class PartnerShipping extends User {

    // A shipping partner handles many shipments
    @OneToMany(mappedBy = "shippingPartner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Shipment> shipments = new ArrayList<>();
}
