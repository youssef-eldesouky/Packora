package com.packora.backend.controller;

import com.packora.backend.dto.shipment.AssignPartnerRequest;
import com.packora.backend.dto.shipment.ShipmentResponse;
import com.packora.backend.dto.shipment.ShipmentStatusUpdateRequest;
import com.packora.backend.service.ShipmentService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * ShipmentController — REST API for shipment tracking and management.
 *
 * ┌──────────────────────────────────────────────────────────────┬────────────────────────────────────────┐
 * │ Endpoint                                                     │ Purpose                                │
 * ├──────────────────────────────────────────────────────────────┼────────────────────────────────────────┤
 * │ GET  /api/shipments/order/{orderId}                          │ Get tracking for an order (Track page) │
 * │ GET  /api/shipments/{id}                                     │ Get shipment by shipment ID            │
 * │ PUT  /api/shipments/{id}/status                              │ Update shipment status (Admin/Partner) │
 * │ PUT  /api/shipments/{id}/assign-partner                      │ Assign shipping partner (Admin)        │
 * └──────────────────────────────────────────────────────────────┴────────────────────────────────────────┘
 *
 * NOTE on authentication:
 *   - GET endpoints: public for now (should restrict to order owner or admin post-JWT)
 *   - PUT /status:   should be restricted to ADMIN or the assigned PARTNER_SHIPPING
 *   - PUT /assign:   should be restricted to ADMIN only
 */
@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {

    private static final Logger log = LoggerFactory.getLogger(ShipmentController.class);

    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    // ── GET /api/shipments/order/{orderId} ────────────────────────────────────

    /**
     * Primary endpoint used by the Track page.
     *
     * Returns the full shipment record for a given order, including:
     *   - Real tracking number (e.g. TRK-3F9A1B2C-0042)
     *   - Current status and location label
     *   - Server-computed timeline of completed milestones
     *   - Assigned shipping partner info (if any)
     *
     * Returns 404 if the order does not exist, or if the order
     * exists but has no shipment created yet.
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ShipmentResponse> getShipmentByOrderId(@PathVariable Long orderId) {
        log.info("[ShipmentController] GET /api/shipments/order/{}", orderId);
        return ResponseEntity.ok(shipmentService.getShipmentByOrderId(orderId));
    }

    // ── GET /api/shipments/{id} ───────────────────────────────────────────────

    /**
     * Get a shipment directly by its shipment ID.
     * Useful for admin dashboards that already know the shipment ID.
     *
     * Returns 404 if not found.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ShipmentResponse> getShipmentById(@PathVariable Long id) {
        log.info("[ShipmentController] GET /api/shipments/{}", id);
        return ResponseEntity.ok(shipmentService.getShipmentById(id));
    }

    // ── PUT /api/shipments/{id}/status ────────────────────────────────────────

    /**
     * Update a shipment's status.
     *
     * Valid forward transitions only (enforced in service):
     *   PREPARING → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED
     *   Any non-terminal status → RETURNED
     *
     * Request body: { "status": "IN_TRANSIT" }
     *
     * Returns 400 if the transition is not allowed.
     * Returns 404 if the shipment does not exist.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'PARTNER_SHIPPING')")
    @PutMapping("/{id}/status")
    public ResponseEntity<ShipmentResponse> updateShipmentStatus(
            @PathVariable Long id,
            @Valid @RequestBody ShipmentStatusUpdateRequest request) {

        log.info("[ShipmentController] PUT /api/shipments/{}/status — newStatus={}", id, request.getStatus());
        return ResponseEntity.ok(shipmentService.updateShipmentStatus(id, request.getStatus()));
    }

    // ── PUT /api/shipments/{id}/assign-partner ────────────────────────────────

    /**
     * Assign (or reassign) a shipping partner to a shipment.
     *
     * The partner must exist in the database and have the PARTNER_SHIPPING role.
     * Cannot assign a partner to a DELIVERED or RETURNED shipment.
     *
     * Request body: { "partnerId": 7 }
     *
     * Returns 400 if the user is not a shipping partner, or if the
     *         shipment is already in a terminal state.
     * Returns 404 if the shipment or partner user does not exist.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/assign-partner")
    public ResponseEntity<ShipmentResponse> assignShippingPartner(
            @PathVariable Long id,
            @Valid @RequestBody AssignPartnerRequest request) {

        log.info("[ShipmentController] PUT /api/shipments/{}/assign-partner — partnerId={}",
                id, request.getPartnerId());
        return ResponseEntity.ok(shipmentService.assignShippingPartner(id, request));
    }
}
