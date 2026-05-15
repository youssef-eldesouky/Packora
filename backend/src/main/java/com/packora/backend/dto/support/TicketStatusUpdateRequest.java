package com.packora.backend.dto.support;

import com.packora.backend.model.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request body for PUT /api/support/tickets/{id}/status.
 *
 * Valid values: OPEN, IN_PROGRESS, RESOLVED, CLOSED
 */
@Data
public class TicketStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private TicketStatus status;
}
