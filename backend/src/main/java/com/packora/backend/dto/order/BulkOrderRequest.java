package com.packora.backend.dto.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/**
 * Request body for POST /api/orders/bulk — placing a bulk order.
 *
 * Contains:
 *  - Sender/warehouse info (used as the "From" address context)
 *  - Cart items (the product(s) being shipped — distributed 1 per recipient)
 *  - Recipients parsed from the uploaded Excel file (1 row = 1 order)
 *
 * Validation contract (enforced by the frontend before submission):
 *   recipients.size() == sum of all item quantities
 *   i.e., one box per recipient.
 */
@Data
public class BulkOrderRequest {

    // ── Sender / Warehouse info ────────────────────────────────────────────
    private String warehouseName;
    private String addressLine;
    private String city;
    private String postalCode;
    private String contactNumber;

    // ── Cart items (product template, quantity distributed 1 per recipient) ─
    @NotEmpty(message = "Bulk order must contain at least one product item")
    @Valid
    private List<CartItemRequest> items;

    // ── Recipient list from Excel ──────────────────────────────────────────
    @NotEmpty(message = "Bulk order must contain at least one recipient")
    @Valid
    private List<BulkRecipientRequest> recipients;
}
