package com.packora.backend.dto.shipment;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request body for PUT /api/shipments/{id}/assign-partner
 *
 * The provided userId must exist in the database and
 * must have the PARTNER_SHIPPING discriminator value.
 * Both checks are enforced in ShipmentServiceImpl.
 */
@Data
public class AssignPartnerRequest {

    @NotNull(message = "partnerId is required")
    private Long partnerId;
}
