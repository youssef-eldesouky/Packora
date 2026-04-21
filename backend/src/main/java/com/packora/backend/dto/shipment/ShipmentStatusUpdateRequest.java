package com.packora.backend.dto.shipment;

import com.packora.backend.model.enums.ShipmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request body for PUT /api/shipments/{id}/status
 *
 * Carries only the target status. Transition validation
 * is enforced in the service layer.
 */
@Data
public class ShipmentStatusUpdateRequest {

    @NotNull(message = "status is required")
    private ShipmentStatus status;
}
