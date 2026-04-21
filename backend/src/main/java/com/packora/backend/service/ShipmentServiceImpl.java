package com.packora.backend.service;

import com.packora.backend.dto.shipment.AssignPartnerRequest;
import com.packora.backend.dto.shipment.ShipmentResponse;
import com.packora.backend.exception.ResourceNotFoundException;
import com.packora.backend.model.Order;
import com.packora.backend.model.Shipment;
import com.packora.backend.model.User;
import com.packora.backend.model.enums.ShipmentStatus;
import com.packora.backend.repository.OrderRepository;
import com.packora.backend.repository.ShipmentRepository;
import com.packora.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Implementation of {@link ShipmentService}.
 *
 * Tracking number format: TRK-XXXXXXXX-XXXX
 *   - TRK prefix for easy identification
 *   - 8 random hex chars (from UUID) for uniqueness
 *   - 4-char suffix derived from orderId for traceability
 *
 * Example: TRK-3F9A1B2C-0042
 */
@Service
@Transactional(readOnly = true)
public class ShipmentServiceImpl implements ShipmentService {

    private static final Logger log = LoggerFactory.getLogger(ShipmentServiceImpl.class);

    /**
     * Terminal statuses — once reached, a shipment cannot be moved
     * to any prior status. RETURNED is terminal because the shipment
     * cycle is complete (even if not in the customer's favour).
     */
    private static final Set<ShipmentStatus> TERMINAL_STATUSES =
            Set.of(ShipmentStatus.DELIVERED, ShipmentStatus.RETURNED);

    private final ShipmentRepository shipmentRepository;
    private final OrderRepository    orderRepository;
    private final UserRepository     userRepository;

    public ShipmentServiceImpl(ShipmentRepository shipmentRepository,
                               OrderRepository orderRepository,
                               UserRepository userRepository) {
        this.shipmentRepository = shipmentRepository;
        this.orderRepository    = orderRepository;
        this.userRepository     = userRepository;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  Create (called by OrderService, not a public endpoint)
    // ══════════════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public ShipmentResponse createShipmentForOrder(Long orderId) {
        Order order = findOrderOrThrow(orderId);

        // Idempotency guard: if a shipment already exists for this order, return it
        shipmentRepository.findByOrderId(orderId).ifPresent(existing -> {
            throw new IllegalStateException(
                    "A shipment already exists for order " + orderId
                    + " (trackingNumber=" + existing.getTrackingNumber() + ")");
        });

        String trackingNumber = generateTrackingNumber(orderId);

        Shipment shipment = new Shipment();
        shipment.setOrder(order);
        shipment.setTrackingNumber(trackingNumber);
        shipment.setStatus(ShipmentStatus.PREPARING);

        Shipment saved = shipmentRepository.save(shipment);
        log.info("[ShipmentService] Created shipment {} for order {}. Tracking: {}",
                saved.getId(), orderId, trackingNumber);

        return toShipmentResponse(saved);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  Read Operations
    // ══════════════════════════════════════════════════════════════════════════

    @Override
    public ShipmentResponse getShipmentByOrderId(Long orderId) {
        // Validate order exists first so we give a meaningful error
        if (!orderRepository.existsById(orderId)) {
            throw new ResourceNotFoundException("Order", orderId);
        }
        Shipment shipment = shipmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Shipment for order " + orderId + " not found. " +
                        "The order may not have been processed yet."));
        return toShipmentResponse(shipment);
    }

    @Override
    public ShipmentResponse getShipmentById(Long shipmentId) {
        return toShipmentResponse(findShipmentOrThrow(shipmentId));
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  Mutations
    // ══════════════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public ShipmentResponse updateShipmentStatus(Long shipmentId, ShipmentStatus newStatus) {
        Shipment shipment = findShipmentOrThrow(shipmentId);

        ShipmentStatus current = shipment.getStatus();

        // Guard: terminal shipments are frozen
        if (TERMINAL_STATUSES.contains(current)) {
            throw new IllegalStateException(
                    "Shipment " + shipmentId + " is already "
                    + current.name().toLowerCase().replace('_', ' ')
                    + " and cannot be updated.");
        }

        // Guard: prevent backwards transitions
        // PREPARING → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED / RETURNED
        if (!isValidTransition(current, newStatus)) {
            throw new IllegalStateException(
                    "Invalid status transition for shipment " + shipmentId
                    + ": " + current.name() + " → " + newStatus.name()
                    + ". Shipments can only move forward in the delivery pipeline.");
        }

        shipment.setStatus(newStatus);

        // Automatically stamp deliveryDate when shipment is delivered
        if (newStatus == ShipmentStatus.DELIVERED) {
            shipment.setDeliveryDate(LocalDate.now());
            log.info("[ShipmentService] Shipment {} marked DELIVERED on {}", shipmentId, shipment.getDeliveryDate());
        }

        log.info("[ShipmentService] Shipment {} status: {} -> {}", shipmentId, current, newStatus);
        return toShipmentResponse(shipmentRepository.save(shipment));
    }

    @Override
    @Transactional
    public ShipmentResponse assignShippingPartner(Long shipmentId, AssignPartnerRequest request) {
        Shipment shipment = findShipmentOrThrow(shipmentId);

        User partner = userRepository.findById(request.getPartnerId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getPartnerId()));

        // Validate the user actually is a shipping partner using the discriminator value
        // The discriminator column value is stored in the "role" column (see User entity)
        String discriminatorValue = partner.getClass().getSimpleName();
        if (!"PartnerShipping".equals(discriminatorValue)) {
            throw new IllegalArgumentException(
                    "User " + request.getPartnerId() + " is not a shipping partner. " +
                    "Only users with the PARTNER_SHIPPING role can be assigned to shipments.");
        }

        // Guard: do not reassign already-delivered or returned shipments
        if (TERMINAL_STATUSES.contains(shipment.getStatus())) {
            throw new IllegalStateException(
                    "Cannot reassign a partner to shipment " + shipmentId
                    + " — it is already " + shipment.getStatus().name().toLowerCase().replace('_', ' ') + ".");
        }

        shipment.setShippingPartner(partner);
        Shipment saved = shipmentRepository.save(shipment);

        log.info("[ShipmentService] Shipment {} assigned to partner {} ({})",
                shipmentId, partner.getId(), partner.getUsername());

        return toShipmentResponse(saved);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  Transition validation
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Enforces the valid forward-only delivery pipeline:
     *
     *   PREPARING → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED
     *                                             ↘ RETURNED   (at any non-terminal stage)
     *
     * RETURNED is allowed as an escape hatch from PREPARING, IN_TRANSIT, or OUT_FOR_DELIVERY.
     */
    private boolean isValidTransition(ShipmentStatus current, ShipmentStatus next) {
        // RETURNED is always allowed as long as current is not terminal
        if (next == ShipmentStatus.RETURNED) return true;

        return switch (current) {
            case PREPARING         -> next == ShipmentStatus.IN_TRANSIT;
            case IN_TRANSIT        -> next == ShipmentStatus.OUT_FOR_DELIVERY;
            case OUT_FOR_DELIVERY  -> next == ShipmentStatus.DELIVERED;
            // Terminal states handled by the caller guard above; included for exhaustiveness
            default                -> false;
        };
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  Mapping
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Maps a {@link Shipment} entity to a {@link ShipmentResponse} DTO.
     *
     * Includes a server-computed timeline list so the frontend Track page
     * can ditch its fake generated-from-mock-data timeline and render real data.
     */
    private ShipmentResponse toShipmentResponse(Shipment shipment) {
        Order order = shipment.getOrder();
        User  partner = shipment.getShippingPartner();

        return ShipmentResponse.builder()
                .id(shipment.getId())
                .trackingNumber(shipment.getTrackingNumber())
                .status(toFrontendStatus(shipment.getStatus()))
                .deliveryDate(shipment.getDeliveryDate())
                .createdAt(shipment.getCreatedAt())
                .updatedAt(shipment.getUpdatedAt())
                // Order micro-summary
                .orderId(order.getId())
                .orderStatus(order.getStatus().name().toLowerCase())
                .orderTotal(order.getTotalAmount())
                // Partner (nullable until assigned)
                .shippingPartnerId(partner != null ? partner.getId() : null)
                .shippingPartnerName(partner != null ? partner.getUsername() : null)
                .shippingPartnerCompany(partner != null ? partner.getCompanyName() : null)
                // Derived display fields
                .currentLocation(resolveCurrentLocation(shipment.getStatus()))
                .timeline(buildTimeline(shipment))
                .build();
    }

    /**
     * Converts the backend ShipmentStatus to the lowercase string keys
     * the frontend statusConfig already maps to (delivered, shipped, etc.).
     *
     * Maps:
     *   PREPARING        → "preparing"
     *   IN_TRANSIT       → "shipped"      (matches frontend "shipped" label = "In Transit")
     *   OUT_FOR_DELIVERY → "out_for_delivery"
     *   DELIVERED        → "delivered"
     *   RETURNED         → "returned"
     */
    private String toFrontendStatus(ShipmentStatus status) {
        return switch (status) {
            case PREPARING        -> "preparing";
            case IN_TRANSIT       -> "shipped";
            case OUT_FOR_DELIVERY -> "out_for_delivery";
            case DELIVERED        -> "delivered";
            case RETURNED         -> "returned";
        };
    }

    /**
     * Produces the "Current Location" label the Track page displays
     * below the tracking number.
     */
    private String resolveCurrentLocation(ShipmentStatus status) {
        return switch (status) {
            case PREPARING        -> "Processing at Warehouse";
            case IN_TRANSIT       -> "In Transit";
            case OUT_FOR_DELIVERY -> "Out for Delivery";
            case DELIVERED        -> "Delivered to Business Address";
            case RETURNED         -> "Returned to Sender";
        };
    }

    /**
     * Builds an ordered timeline of milestones based on the shipment's current
     * status and its actual timestamps (createdAt, updatedAt, deliveryDate).
     *
     * Steps are marked completed = true if the shipment has reached or passed them.
     * Only past/completed steps are included — future steps are omitted so the
     * timeline only contains factual events, not predictions.
     */
    private List<ShipmentResponse.TimelineEvent> buildTimeline(Shipment shipment) {
        List<ShipmentResponse.TimelineEvent> timeline = new ArrayList<>();

        ShipmentStatus status = shipment.getStatus();
        LocalDateTime createdAt = shipment.getCreatedAt();

        // Step 1: Order Placed — always present (order.orderDate would be more
        // accurate, but createdAt is close enough and avoids a lazy load)
        timeline.add(ShipmentResponse.TimelineEvent.builder()
                .label("Order Placed")
                .occurredAt(createdAt)
                .completed(true)
                .build());

        // Step 2: Processing at Warehouse — shipment created = PREPARING
        if (status.ordinal() >= ShipmentStatus.PREPARING.ordinal()) {
            timeline.add(ShipmentResponse.TimelineEvent.builder()
                    .label("Processing at Warehouse")
                    .occurredAt(createdAt)
                    .completed(true)
                    .build());
        }

        // Step 3: Shipped / In Transit
        if (status.ordinal() >= ShipmentStatus.IN_TRANSIT.ordinal()) {
            timeline.add(ShipmentResponse.TimelineEvent.builder()
                    .label("Shipped")
                    .occurredAt(shipment.getUpdatedAt())
                    .completed(true)
                    .build());
        }

        // Step 4: Out for Delivery
        if (status.ordinal() >= ShipmentStatus.OUT_FOR_DELIVERY.ordinal()) {
            timeline.add(ShipmentResponse.TimelineEvent.builder()
                    .label("Out for Delivery")
                    .occurredAt(shipment.getUpdatedAt())
                    .completed(true)
                    .build());
        }

        // Step 5: Delivered
        if (status == ShipmentStatus.DELIVERED) {
            LocalDateTime deliveredAt = shipment.getDeliveryDate() != null
                    ? shipment.getDeliveryDate().atStartOfDay()
                    : shipment.getUpdatedAt();
            timeline.add(ShipmentResponse.TimelineEvent.builder()
                    .label("Delivered")
                    .occurredAt(deliveredAt)
                    .completed(true)
                    .build());
        }

        // Step 5 (alt): Returned
        if (status == ShipmentStatus.RETURNED) {
            timeline.add(ShipmentResponse.TimelineEvent.builder()
                    .label("Returned to Sender")
                    .occurredAt(shipment.getUpdatedAt())
                    .completed(true)
                    .build());
        }

        return timeline;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  Tracking number generation
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Generates a unique, human-readable tracking number.
     *
     * Format: TRK-{8 hex chars from UUID}-{4-digit zero-padded orderId}
     * Example: TRK-3F9A1B2C-0042
     *
     * The UUID portion guarantees global uniqueness.
     * The orderId suffix makes it easy to trace a tracking number back
     * to its source order without a database lookup.
     */
    private String generateTrackingNumber(Long orderId) {
        String uuidPart = UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 8)
                .toUpperCase();
        String orderPart = String.format("%04d", orderId % 10000);
        return "TRK-" + uuidPart + "-" + orderPart;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  Lookup helpers
    // ══════════════════════════════════════════════════════════════════════════

    private Shipment findShipmentOrThrow(Long shipmentId) {
        return shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment", shipmentId));
    }

    private Order findOrderOrThrow(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
    }
}
