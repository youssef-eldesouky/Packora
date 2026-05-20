package com.packora.backend.dto.order;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Response returned by POST /api/orders/bulk.
 *
 * The frontend uses:
 *  - primaryOrderId  → passed to Paymob as the anchor order for payment
 *  - totalAmount     → the combined amount across all created orders (for Paymob)
 *  - bulkGroupId     → shared UUID linking all orders in this session
 *  - recipientCount  → number of orders successfully created
 *  - orderIds        → all created order IDs (for tracking / display)
 */
@Data
@Builder
public class BulkOrderResponse {

    /** The first order's ID — used as the Paymob anchor for the payment session. */
    private Long primaryOrderId;

    /** Sum of all individual order amounts (includes 8% tax). */
    private Double totalAmount;

    /** Shared UUID identifying all orders in this bulk session. */
    private String bulkGroupId;

    /** How many orders were created (= number of valid Excel recipients). */
    private int recipientCount;

    /** All created order IDs, in the same sequence as the recipients list. */
    private List<Long> orderIds;
}
