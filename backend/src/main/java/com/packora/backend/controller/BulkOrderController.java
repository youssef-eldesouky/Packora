package com.packora.backend.controller;

import com.packora.backend.dto.order.BulkOrderRequest;
import com.packora.backend.dto.order.BulkOrderResponse;
import com.packora.backend.security.services.UserDetailsImpl;
import com.packora.backend.service.BulkOrderService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * BulkOrderController — handles the Bulk Order wizard submission.
 *
 * ┌──────────────────────────────────┬──────────────────────────────────────────┐
 * │ Endpoint                         │ Purpose                                  │
 * ├──────────────────────────────────┼──────────────────────────────────────────┤
 * │ POST /api/orders/bulk            │ Place a bulk order (one order/recipient) │
 * └──────────────────────────────────┴──────────────────────────────────────────┘
 *
 * Request body: {@link BulkOrderRequest}
 *   - warehouseName, addressLine, city, postalCode, contactNumber  (sender info)
 *   - items[]      cart product items (distributed 1-per-recipient)
 *   - recipients[] rows parsed from the uploaded Excel file
 *
 * Response: {@link BulkOrderResponse}
 *   - primaryOrderId  → anchor order for the Paymob payment session
 *   - totalAmount     → combined total across all created orders
 *   - bulkGroupId     → shared UUID; callback uses it to update all orders
 *   - orderIds        → list of every created order ID
 */
@RestController
@RequestMapping("/api/orders/bulk")
public class BulkOrderController {

    private static final Logger log = LoggerFactory.getLogger(BulkOrderController.class);

    private final BulkOrderService bulkOrderService;

    public BulkOrderController(BulkOrderService bulkOrderService) {
        this.bulkOrderService = bulkOrderService;
    }

    /**
     * POST /api/orders/bulk
     *
     * Accessible only to authenticated BUSINESS_OWNER users.
     * Creates one order per recipient row in a single atomic transaction.
     * Returns 201 Created with the bulk order summary.
     */
    @PostMapping
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<BulkOrderResponse> placeBulkOrder(
            @Valid @RequestBody BulkOrderRequest request,
            @AuthenticationPrincipal UserDetailsImpl principal) {

        log.info("[BulkOrderController] POST /api/orders/bulk — userId={}, recipients={}",
                principal.getId(), request.getRecipients().size());

        BulkOrderResponse response = bulkOrderService.placeBulkOrder(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
