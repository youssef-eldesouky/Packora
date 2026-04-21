package com.packora.backend.dto.shipment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Full response envelope for a Shipment.
 *
 * Returned by all shipment endpoints. Designed to give the Track page
 * everything it needs in one call — no second requests needed.
 *
 * The {@code timeline} field is a server-computed ordered list of milestones
 * that the frontend can render directly, replacing the fake generated timeline
 * in Track.jsx.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentResponse {

    private Long id;

    private String trackingNumber;

    /** Status as lowercase string — matches the frontend statusConfig keys. */
    private String status;

    private LocalDate deliveryDate;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── Order info (micro-summary — avoids a second API call) ─────────────────
    private Long    orderId;
    private String  orderStatus;
    private Double  orderTotal;

    // ── Shipping partner info (nullable until assigned) ───────────────────────
    private Long    shippingPartnerId;
    private String  shippingPartnerName;
    private String  shippingPartnerCompany;

    // ── Current location label matching what the frontend already shows ───────
    private String currentLocation;

    /**
     * Ordered list of milestone events for the tracking timeline.
     * Each entry maps to one step in the frontend timeline component.
     */
    private List<TimelineEvent> timeline;

    // ── Nested types ──────────────────────────────────────────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimelineEvent {
        private String label;
        private LocalDateTime occurredAt;
        private boolean completed;
    }
}
