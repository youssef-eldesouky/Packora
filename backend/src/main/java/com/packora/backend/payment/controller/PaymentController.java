package com.packora.backend.payment.controller;

import com.packora.backend.payment.dto.PaymentInitRequest;
import com.packora.backend.payment.dto.PaymentInitResponse;
import com.packora.backend.payment.dto.PaymobCallbackPayload;
import com.packora.backend.payment.service.PaymobService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * PaymentController — exposes the Paymob payment endpoints.
 *
 * Endpoints:
 *  POST /api/payment/initiate     → Initiates a Paymob payment, returns iframe URL
 *  POST /api/payment/callback     → Paymob webhook: processes transaction result
 *  GET  /api/payment/health       → Simple health check
 */
@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final PaymobService paymobService;

    public PaymentController(PaymobService paymobService) {
        this.paymobService = paymobService;
    }

    // ── POST /api/payment/initiate ─────────────────────────────────────────

    /**
     * Frontend calls this endpoint to start a payment.
     *
     * Request body:
     * {
     *   "orderId": 1,
     *   "amount": 250.00,
     *   "billingData": {
     *     "firstName": "John",
     *     "lastName": "Doe",
     *     "email": "john@example.com",
     *     "phoneNumber": "+201000000000",
     *     "street": "123 Main St",
     *     "city": "Cairo"
     *   }
     * }
     *
     * Response:
     * {
     *   "iframeUrl": "https://accept.paymob.com/api/acceptance/iframes/964127?payment_token=...",
     *   "paymentKey": "...",
     *   "paymobOrderId": 123456
     * }
     */
    @PostMapping("/initiate")
    public ResponseEntity<?> initiatePayment(@Valid @RequestBody PaymentInitRequest request) {
        log.info("[PaymentController] Payment initiation request for order ID: {}", request.getOrderId());
        try {
            PaymentInitResponse response = paymobService.initiatePayment(
                request.getOrderId(),
                request.getAmount(),
                request.getBillingData()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("[PaymentController] Payment initiation failed", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Payment initiation failed: " + e.getMessage()));
        }
    }

    // ── POST /api/payment/callback ─────────────────────────────────────────

    /**
     * Paymob calls this webhook endpoint after a transaction is processed.
     *
     * Configure this URL in your Paymob Dashboard under:
     *   Developers → Payment Integrations → [Your Integration] → Transaction processed callback
     *
     * The ?hmac= query parameter is added automatically by Paymob
     * and is used to verify the request authenticity.
     *
     * Paymob expects an HTTP 200 response to acknowledge receipt.
     */
    @PostMapping("/callback")
    public ResponseEntity<String> handleCallback(
            @RequestBody PaymobCallbackPayload payload,
            @RequestParam(value = "hmac", required = false) String hmac) {

        log.info("[PaymentController] Paymob callback received — type: {}", payload.getType());
        try {
            paymobService.processCallback(payload, hmac);
            return ResponseEntity.ok("OK");
        } catch (SecurityException e) {
            log.warn("[PaymentController] Rejected callback — invalid HMAC");
            return ResponseEntity.status(403).body("Invalid HMAC signature");
        } catch (Exception e) {
            log.error("[PaymentController] Callback processing error", e);
            // Return 200 anyway to prevent Paymob from retrying (handle internally)
            return ResponseEntity.ok("Received");
        }
    }

    // ── GET /api/payment/health ────────────────────────────────────────────

    /**
     * Simple health check to verify the payment service is up.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "Paymob Payment Service",
            "provider", "Paymob Accept API"
        ));
    }
}
