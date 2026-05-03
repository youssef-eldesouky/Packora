package com.packora.backend.dto.order;

import com.packora.backend.model.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request body for PUT /api/orders/{id}/status (Admin only).
 *
 * Carries just the target status. The service layer enforces
 * valid transition rules (e.g. cannot un-cancel an order).
 */
@Data
public class OrderStatusUpdateRequest {

    @NotNull(message = "status is required")
    private OrderStatus status;
}
