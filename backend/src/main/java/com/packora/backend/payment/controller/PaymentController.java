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

import org.springframework.beans.factory.annotation.Value;
import java.util.Map;

/**
 * PaymentController — Paymob payment endpoints.
 *
 * Endpoints:
 *  POST /api/payment/initiate     → Frontend starts a payment, returns iFrame URL + key
 *  POST /api/payment/callback     → Paymob webhook: processes transaction result
 *  GET  /api/payment/callback     → Paymob GET redirect after transaction (required by Paymob)
 *  GET  /api/payment/health       → Simple health check
 *
 * Security note:
 *  - /api/payment/callback is PUBLIC in WebSecurityConfig (Paymob calls it without a JWT).
 *  - /api/payment/initiate requires authentication (JWT) — only logged-in users can pay.
 *  - HMAC validation is performed inside PaymobService before any DB mutation.
 */
@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final PaymobService paymobService;

    @Value("${packora.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public PaymentController(PaymobService paymobService) {
        this.paymobService = paymobService;
    }

    // ── POST /api/payment/initiate ──────────────────────────────────────────

    /**
     * Called by the frontend (ReviewOrder step) to kick off the Paymob flow.
     *
     * Request body:
     * {
     *   "orderId": 1,
     *   "amount": 250.00,
     *   "billingData": {
     *     "firstName": "Ahmed",
     *     "lastName":  "Hassan",
     *     "email":     "ahmed@example.com",
     *     "phoneNumber": "+201000000000",
     *     "street":    "123 Tahrir St",
     *     "city":      "Cairo"
     *   }
     * }
     *
     * Success response:
     * {
     *   "iframeUrl":     "https://accept.paymob.com/api/acceptance/iframes/964127?payment_token=...",
     *   "paymentKey":    "...",
     *   "paymobOrderId": 98765
     * }
     */
    @PostMapping("/initiate")
    public ResponseEntity<?> initiatePayment(@Valid @RequestBody PaymentInitRequest request) {
        log.info("[PaymentController] Initiate payment — orderId={}", request.getOrderId());
        try {
            PaymentInitResponse response = paymobService.initiatePayment(
                request.getOrderId(),
                request.getAmount(),
                request.getBillingData()
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            // e.g. order not found
            log.warn("[PaymentController] Bad request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (PaymobService.PaymentException e) {
            log.error("[PaymentController] Paymob API error: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Payment gateway error. Please try again."));
        } catch (Exception e) {
            log.error("[PaymentController] Unexpected error during payment initiation", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Payment initiation failed. Please contact support."));
        }
    }

    // ── POST /api/payment/callback ──────────────────────────────────────────

    /**
     * Paymob's Transaction Processed Callback.
     *
     * Paymob POSTs the transaction result here after the card is charged.
     * The ?hmac= query param contains a signature we validate in PaymobService.
     *
     * Dashboard setting:
     *   Developers → Payment Integrations → [packora] → Transaction processed callback
     *
     * Paymob expects HTTP 200 to acknowledge receipt (otherwise it retries).
     * We always return 200 on non-security errors to prevent infinite retries;
     * errors are handled and logged internally.
     */
    @PostMapping("/callback")
    public ResponseEntity<String> handlePostCallback(
            @RequestBody(required = false) PaymobCallbackPayload payload,
            @RequestParam(value = "hmac", required = false) String hmac) {

        log.info("[PaymentController] POST callback received — type={}",
                 payload != null ? payload.getType() : "null");

        if (payload == null) {
            log.warn("[PaymentController] Empty callback body — ignoring");
            return ResponseEntity.ok("OK");
        }

        try {
            paymobService.processCallback(payload, hmac);
            return ResponseEntity.ok("OK");
        } catch (SecurityException e) {
            // HMAC mismatch — reject with 403 to signal to Paymob (or attacker) it was invalid
            log.warn("[PaymentController] Rejected callback — invalid HMAC");
            return ResponseEntity.status(403).body("Invalid HMAC signature");
        } catch (PaymobService.AlreadyProcessedException e) {
            // Idempotent: already processed, acknowledge with 200 to stop retries
            log.info("[PaymentController] Duplicate callback ignored: {}", e.getMessage());
            return ResponseEntity.ok("Already processed");
        } catch (Exception e) {
            // Internal error: log it, but return 200 so Paymob doesn't keep retrying.
            // The failure will be visible in logs and can be fixed/reprocessed manually.
            log.error("[PaymentController] Callback processing error", e);
            return ResponseEntity.ok("Received");
        }
    }

    // ── GET /api/payment/callback ───────────────────────────────────────────

    /**
     * Paymob's Transaction Response Callback (redirect after card form).
     *
     * Paymob issues a browser GET redirect to this URL after the transaction
     * completes. The query params contain the transaction result.
     *
     * We redirect the user to the appropriate frontend page based on success/failure.
     * The frontend pages then poll the backend for the definitive order status
     * (which was set by the POST webhook above).
     *
     * Dashboard setting:
     *   Developers → Payment Integrations → [packora] → Transaction response callback
     */
    @GetMapping("/callback")
    public ResponseEntity<Void> handleGetCallback(
            @RequestParam(value = "success", defaultValue = "false") boolean success,
            @RequestParam(value = "id", required = false) String transactionId,
            @RequestParam(value = "order", required = false) String paymobOrderId) {

        log.info("[PaymentController] GET redirect — success={}, txnId={}", success, transactionId);

        // Redirect back to checkout on step 3 (Review) with payment status
        String frontendRedirect = frontendUrl + "/Cart/checkout?step=review&success=" + success + "&txn=" + transactionId;

        return ResponseEntity.status(302)
            .header("Location", frontendRedirect)
            .build();
    }

    // ── GET /api/payment/health ─────────────────────────────────────────────

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status",   "UP",
            "service",  "Paymob Payment Service",
            "provider", "Paymob Accept API"
        ));
    }
}
