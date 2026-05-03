package com.packora.backend.service;

import com.packora.backend.dto.shipment.AssignPartnerRequest;
import com.packora.backend.dto.shipment.ShipmentResponse;
import com.packora.backend.model.enums.ShipmentStatus;

/**
 * Shipment domain service interface.
 *
 * Covers the full shipment lifecycle:
 *   auto-create on order → track by order → update status → assign partner
 */
public interface ShipmentService {

    /**
     * Create a new shipment record for a just-placed order.
     * Generates a unique tracking number and sets status to PREPARING.
     *
     * Called internally by {@link OrderService#placeOrder} — not exposed
     * as a standalone endpoint. Marked package-visible for that reason.
     *
     * @param orderId the ID of the newly saved order
     * @return the persisted ShipmentResponse
     */
    ShipmentResponse createShipmentForOrder(Long orderId);

    /**
     * Retrieve the shipment associated with a given order.
     * Throws {@link com.packora.backend.exception.ResourceNotFoundException}
     * if the order has no shipment yet.
     *
     * Used by the frontend Track page.
     */
    ShipmentResponse getShipmentByOrderId(Long orderId);

    /**
     * Retrieve a shipment directly by its shipment ID.
     */
    ShipmentResponse getShipmentById(Long shipmentId);

    /**
     * Update the shipment's status (Admin or shipping partner).
     * Enforces transition rules — terminal statuses cannot be changed.
     * When status becomes DELIVERED, sets the deliveryDate to today.
     */
    ShipmentResponse updateShipmentStatus(Long shipmentId, ShipmentStatus newStatus);

    /**
     * Assign (or reassign) a shipping partner to a shipment.
     * Validates that the given user exists and is a PARTNER_SHIPPING.
     */
    ShipmentResponse assignShippingPartner(Long shipmentId, AssignPartnerRequest request);
}
