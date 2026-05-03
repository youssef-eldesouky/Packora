package com.packora.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Business Owner — places orders for packaging products.
 * Has billing/shipping addresses and a collection of orders.
 */
@Entity
@DiscriminatorValue("BUSINESS_OWNER")
@Getter
@Setter
@NoArgsConstructor
public class BusinessOwner extends User {

    private String billingAddress;

    private String shippingAddress;

    // A business owner can place many orders
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Order> orders = new ArrayList<>();
}
