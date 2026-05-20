package com.packora.backend.service;

import com.packora.backend.dto.order.BulkOrderRequest;
import com.packora.backend.dto.order.BulkOrderResponse;

public interface BulkOrderService {

    /**
     * Places a bulk order by creating one order per recipient in a single transaction.
     *
     * Cart items are expanded by quantity into a flat slot list and assigned
     * one slot per recipient:
     *   e.g. cart=[{productA, qty=3}] + 3 recipients
     *        → Order1: recipient1, productA, qty=1
     *        → Order2: recipient2, productA, qty=1
     *        → Order3: recipient3, productA, qty=1
     *
     * All orders share the same bulkGroupId UUID so the Paymob payment callback
     * can mark them all as PROCESSING in one shot.
     *
     * @param request  the full bulk order payload (warehouse info + items + recipients)
     * @param userId   the ID of the authenticated user placing the order
     * @return BulkOrderResponse with all order IDs, total amount, and bulkGroupId
     */
    BulkOrderResponse placeBulkOrder(BulkOrderRequest request, Long userId);
}
