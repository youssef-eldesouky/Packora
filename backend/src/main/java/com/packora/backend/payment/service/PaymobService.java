package com.packora.backend.payment.service;

import com.packora.backend.model.Order;
import com.packora.backend.model.Payment;
import com.packora.backend.model.enums.OrderStatus;
import com.packora.backend.model.enums.PaymentStatus;
import com.packora.backend.payment.config.PaymobConfig;
import com.packora.backend.payment.dto.*;
import com.packora.backend.repository.OrderRepository;
import com.packora.backend.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * PaymobService — orchestrates the Paymob Accept API 3-step payment flow:
 *
 *  Step 1 → POST /auth/tokens            : authenticate → get auth_token
 *  Step 2 → POST /ecommerce/orders       : register order → get paymob_order_id
 *  Step 3 → POST /acceptance/payment_keys: get payment key → build iframe URL
 *
 * Security measures:
 *  - HMAC-SHA512 verification on every inbound webhook
 *  - Idempotency: unique merchant_order_id using UUID suffix prevents Paymob
 *    from rejecting duplicate submissions on network retries
 *  - Order status is synced in the same DB transaction as the Payment update
 *  - All Paymob API errors are wrapped in a PaymentException for uniform handling
 */
@Service
public class PaymobService {

    private static final Logger log = LoggerFactory.getLogger(PaymobService.class);

    private final PaymobConfig      paymobConfig;
    private final RestTemplate      restTemplate;
    private final OrderRepository   orderRepository;
    private final PaymentRepository paymentRepository;

    public PaymobService(PaymobConfig paymobConfig,
                         RestTemplate restTemplate,
                         OrderRepository orderRepository,
                         PaymentRepository paymentRepository) {
        this.paymobConfig      = paymobConfig;
        this.restTemplate      = restTemplate;
        this.orderRepository   = orderRepository;
        this.paymentRepository = paymentRepository;
    }

    // ── PUBLIC API ──────────────────────────────────────────────────────────

    /**
     * Executes the full Paymob 3-step flow and returns a PaymentInitResponse
     * with the iFrame URL ready for the frontend to embed.
     *
     * @param orderId    internal Packora order ID
     * @param amountEGP  total in EGP (converted to cents for Paymob)
     * @param billing    buyer billing info required by Paymob
     */
    @Transactional
    public PaymentInitResponse initiatePayment(Long orderId, Double amountEGP, BillingData billing) {
        log.info("[Paymob] Initiating payment for order ID: {}", orderId);

        // Validate that the order exists before calling Paymob
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        // Step 1 — Authenticate
        String authToken = authenticate();
        log.info("[Paymob] Step 1 ✔ auth_token obtained");

        // Step 2 — Register order with a unique merchant_order_id for idempotency.
        // Appending a UUID suffix prevents Paymob from blocking retries on the same
        // internal order ID (Paymob rejects duplicate merchant_order_id values).
        long amountCents = Math.round(amountEGP * 100);
        String merchantOrderId = orderId + "-" + UUID.randomUUID().toString().substring(0, 8);
        Long paymobOrderId = registerOrder(authToken, merchantOrderId, amountCents);
        log.info("[Paymob] Step 2 ✔ paymob_order_id={}", paymobOrderId);

        // Step 3 — Get payment key
        String paymentKey = getPaymentKey(authToken, paymobOrderId, amountCents, billing);
        log.info("[Paymob] Step 3 ✔ payment_key obtained");

        // Build the Paymob iFrame URL
        String iframeUrl = buildIframeUrl(paymentKey);

        // Persist a PENDING payment record so the webhook can match it later
        persistPendingPayment(order, amountEGP, paymobOrderId, merchantOrderId);

        return new PaymentInitResponse(iframeUrl, paymentKey, paymobOrderId);
    }

    /**
     * Processes an inbound Paymob webhook callback.
     *
     * Security flow:
     *  1. Reject immediately if HMAC is absent or wrong → 403
     *  2. Guard against duplicate processing (idempotency)
     *  3. Update Payment + Order status atomically in one DB transaction
     *
     * @param payload   parsed JSON body from Paymob
     * @param hmacValue HMAC signature from the ?hmac= query param
     */
    @Transactional
    public void processCallback(PaymobCallbackPayload payload, String hmacValue) {

        // ── Security gate: verify HMAC BEFORE touching the database ──────────
        // This is the single most important check — it proves the request genuinely
        // came from Paymob and hasn't been tampered with in transit.
        if (!verifyHmac(payload, hmacValue)) {
            log.warn("[Paymob] HMAC verification FAILED — callback rejected");
            throw new SecurityException("Invalid Paymob HMAC signature");
        }

        PaymobCallbackPayload.TransactionObj txn = payload.getObj();
        if (txn == null) {
            log.warn("[Paymob] Callback has null transaction object — skipping");
            return;
        }

        String paymobTxnId = String.valueOf(txn.getId());
        boolean success    = txn.isSuccess();
        log.info("[Paymob] Callback — txnId={}, success={}", paymobTxnId, success);

        // ── Idempotency guard ────────────────────────────────────────────────
        // Paymob may retry the webhook. If we've already set the final status,
        // skip reprocessing to avoid double-charging/double-crediting.
        paymentRepository.findByTransactionId(paymobTxnId).ifPresent(existing -> {
            if (existing.getStatus() != PaymentStatus.PENDING) {
                log.info("[Paymob] txn {} already processed (status={}), skipping",
                         paymobTxnId, existing.getStatus());
                throw new AlreadyProcessedException("Transaction already processed: " + paymobTxnId);
            }
        });

        // ── Look up the pending Payment record ──────────────────────────────
        // Try by Paymob transaction ID first, then fall back to merchantOrderId.
        Payment payment = resolvePayment(txn, paymobTxnId);
        if (payment == null) {
            log.warn("[Paymob] No matching PENDING payment found for txnId={}", paymobTxnId);
            return;
        }

        // ── Update Payment status ────────────────────────────────────────────
        updatePaymentStatus(payment, success, txn);

        // ── Sync Order status based on payment outcome ───────────────────────
        syncOrderStatus(payment.getOrder(), success, txn);
    }

    // ── PRIVATE — Paymob Step 1: Authenticate ──────────────────────────────

    @SuppressWarnings("unchecked")
    private String authenticate() {
        String url = paymobConfig.getBaseUrl() + "/auth/tokens";
        Map<String, Object> body = new HashMap<>();
        body.put("api_key", paymobConfig.getApiKey());

        try {
            ResponseEntity<Map> resp = restTemplate.postForEntity(url, jsonRequest(body), Map.class);
            validateResponse(resp, "authentication");
            String token = (String) resp.getBody().get("token");
            if (token == null || token.isBlank()) {
                throw new PaymentException("Paymob auth failed — empty token");
            }
            return token;
        } catch (RestClientException e) {
            throw new PaymentException("Paymob authentication request failed: " + e.getMessage(), e);
        }
    }

    // ── PRIVATE — Paymob Step 2: Register Order ────────────────────────────

    @SuppressWarnings("unchecked")
    private Long registerOrder(String authToken, String merchantOrderId, long amountCents) {
        String url = paymobConfig.getBaseUrl() + "/ecommerce/orders";
        Map<String, Object> body = new HashMap<>();
        body.put("auth_token",        authToken);
        body.put("delivery_needed",   false);
        body.put("amount_cents",      amountCents);
        body.put("currency",          "EGP");
        // merchantOrderId includes a UUID suffix for idempotency — see initiatePayment()
        body.put("merchant_order_id", merchantOrderId);
        body.put("items",             List.of());

        try {
            ResponseEntity<Map> resp = restTemplate.postForEntity(url, jsonRequest(body), Map.class);
            validateResponse(resp, "order registration");
            Object idObj = resp.getBody().get("id");
            if (idObj == null) {
                throw new PaymentException("Paymob order registration failed — no id in response");
            }
            return Long.parseLong(idObj.toString());
        } catch (RestClientException e) {
            throw new PaymentException("Paymob order registration request failed: " + e.getMessage(), e);
        }
    }

    // ── PRIVATE — Paymob Step 3: Payment Key ──────────────────────────────

    @SuppressWarnings("unchecked")
    private String getPaymentKey(String authToken, Long paymobOrderId,
                                  long amountCents, BillingData billing) {
        String url = paymobConfig.getBaseUrl() + "/acceptance/payment_keys";
        Map<String, Object> body = new HashMap<>();
        body.put("auth_token",     authToken);
        body.put("expiration",     3600); // 1-hour expiry
        body.put("order_id",       paymobOrderId);
        body.put("billing_data",   billingDataToMap(billing));
        body.put("amount_cents",   amountCents);
        body.put("currency",       "EGP");
        body.put("integration_id", paymobConfig.getIntegrationId());

        try {
            ResponseEntity<Map> resp = restTemplate.postForEntity(url, jsonRequest(body), Map.class);
            validateResponse(resp, "payment key");
            String token = (String) resp.getBody().get("token");
            if (token == null || token.isBlank()) {
                throw new PaymentException("Paymob payment key failed — empty token");
            }
            return token;
        } catch (RestClientException e) {
            throw new PaymentException("Paymob payment key request failed: " + e.getMessage(), e);
        }
    }

    // ── PRIVATE — DB Helpers ────────────────────────────────────────────────

    /** Creates a PENDING Payment record linked to the Order. */
    private void persistPendingPayment(Order order, Double amountEGP,
                                        Long paymobOrderId, String merchantOrderId) {
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(amountEGP);
        payment.setMethod("CARD");
        payment.setStatus(PaymentStatus.PENDING);
        // Use the merchant_order_id as a temporary transaction ID so the webhook
        // lookup can fall back to it if the Paymob txn ID isn't available yet.
        payment.setTransactionId("PAYMOB_ORDER_" + paymobOrderId);
        paymentRepository.save(payment);
        log.info("[Paymob] PENDING payment saved for order={}, paymobOrder={}", order.getId(), paymobOrderId);
    }

    /**
     * Resolves the Payment entity to update.
     * Tries Paymob transaction ID first, then falls back to the merchant_order_id
     * prefix stored in the placeholder transactionId.
     */
    private Payment resolvePayment(PaymobCallbackPayload.TransactionObj txn, String paymobTxnId) {
        // Try by exact Paymob transaction ID
        var byTxnId = paymentRepository.findByTransactionId(paymobTxnId);
        if (byTxnId.isPresent()) return byTxnId.get();

        // Fall back: look for the PENDING record we stored as "PAYMOB_ORDER_<paymobOrderId>"
        if (txn.getOrder() != null) {
            String placeholder = "PAYMOB_ORDER_" + txn.getOrder().getId();
            var byPlaceholder = paymentRepository.findByTransactionId(placeholder);
            if (byPlaceholder.isPresent() && byPlaceholder.get().getStatus() == PaymentStatus.PENDING) {
                return byPlaceholder.get();
            }

            // Last resort: find by internal Packora order ID if merchant_order_id is parseable
            String merchantOrderId = txn.getOrder().getMerchantOrderId();
            if (merchantOrderId != null) {
                // merchantOrderId format: "<orderId>-<uuid-suffix>"
                String[] parts = merchantOrderId.split("-", 2);
                try {
                    Long packOrderId = Long.parseLong(parts[0]);
                    List<Payment> pending = paymentRepository.findByOrderId(packOrderId)
                            .stream()
                            .filter(p -> p.getStatus() == PaymentStatus.PENDING)
                            .toList();
                    if (!pending.isEmpty()) return pending.get(0);
                } catch (NumberFormatException ignored) {
                    log.warn("[Paymob] Cannot parse orderId from merchantOrderId='{}'", merchantOrderId);
                }
            }
        }
        return null;
    }

    /** Updates the Payment entity status and saves it. */
    private void updatePaymentStatus(Payment payment, boolean success,
                                      PaymobCallbackPayload.TransactionObj txn) {
        String paymobTxnId = String.valueOf(txn.getId());

        if (txn.isVoided() || txn.isRefunded()) {
            payment.setStatus(PaymentStatus.REFUNDED);
        } else if (success) {
            payment.setStatus(PaymentStatus.COMPLETED);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }

        // Replace the placeholder transactionId with the real Paymob txn ID
        payment.setTransactionId(paymobTxnId);
        paymentRepository.save(payment);
        log.info("[Paymob] Payment {} → {}", paymobTxnId, payment.getStatus());
    }

    /**
     * Syncs the Order's status based on the payment outcome.
     * If the order belongs to a bulk session (bulkGroupId != null), all sibling
     * orders in the same group are updated to the same status in one shot.
     */
    private void syncOrderStatus(Order order, boolean success,
                                  PaymobCallbackPayload.TransactionObj txn) {
        if (order == null) return;

        OrderStatus newStatus = null;
        if (txn.isVoided() || txn.isRefunded()) {
            newStatus = OrderStatus.CANCELLED;
        } else if (success) {
            // Payment confirmed — move order to PROCESSING so the team can fulfil it
            newStatus = OrderStatus.PROCESSING;
        }
        // On failure we leave the order as PENDING so the user can retry payment
        if (newStatus == null) {
            orderRepository.save(order);
            return;
        }

        // If this is a bulk order, update ALL orders in the same group
        String bulkGroupId = order.getBulkGroupId();
        if (bulkGroupId != null && !bulkGroupId.isBlank()) {
            List<Order> siblingOrders = orderRepository.findByBulkGroupId(bulkGroupId);
            final OrderStatus finalStatus = newStatus;
            siblingOrders.forEach(o -> {
                o.setStatus(finalStatus);
                orderRepository.save(o);
                log.info("[Paymob] Bulk order {} status synced → {} (bulkGroupId={})",
                        o.getId(), finalStatus, bulkGroupId);
            });
        } else {
            order.setStatus(newStatus);
            orderRepository.save(order);
            log.info("[Paymob] Order {} status synced → {}", order.getId(), newStatus);
        }
    }


    // ── PRIVATE — HMAC-SHA512 Verification ─────────────────────────────────

    /**
     * Verifies the Paymob HMAC-SHA512 signature.
     *
     * Paymob concatenates a specific set of transaction fields (in strict order)
     * and hashes them with your HMAC_SECRET using SHA-512.
     * We replicate the same calculation and compare results.
     *
     * Official field order (Paymob docs):
     *   amount_cents, created_at, currency, error_occured, has_parent_transaction,
     *   id, integration_id, is_3d_secure, is_auth, is_capture, is_refunded,
     *   is_standalone_payment, is_voided, order.id, owner, pending,
     *   source_data.pan, source_data.sub_type, source_data.type, success
     *
     * WHY THIS MATTERS: Without HMAC verification, an attacker could POST a fake
     * "success" callback to your endpoint and mark an unpaid order as PAID.
     */
    private boolean verifyHmac(PaymobCallbackPayload payload, String receivedHmac) {
        if (receivedHmac == null || receivedHmac.isBlank()) {
            log.warn("[Paymob] No HMAC provided in callback");
            return false;
        }

        try {
            PaymobCallbackPayload.TransactionObj t = payload.getObj();
            if (t == null) return false;

            String pan     = (t.getSourceData() != null) ? safeStr(t.getSourceData().getPan())     : "NA";
            String subType = (t.getSourceData() != null) ? safeStr(t.getSourceData().getSubType()) : "NA";
            String srcType = (t.getSourceData() != null) ? safeStr(t.getSourceData().getType())    : "NA";
            String orderId = (t.getOrder()      != null) ? String.valueOf(t.getOrder().getId())     : "NA";

            // Concatenate in the EXACT order Paymob specifies
            String data = String.valueOf(t.getAmountCents())
                        + safeStr(t.getCreatedAt())
                        + safeStr(t.getCurrency())
                        + t.isErrorOccured()
                        + t.isHasParentTransaction()
                        + t.getId()
                        + t.getIntegrationId()
                        + t.is3dSecure()
                        + t.isAuth()
                        + t.isCapture()
                        + t.isRefunded()
                        + t.isStandalonePayment()
                        + t.isVoided()
                        + orderId
                        + t.getOwner()
                        + t.isPending()
                        + pan
                        + subType
                        + srcType
                        + t.isSuccess();

            String calculated = hmacSha512(data, paymobConfig.getHmacSecret());

            // Use constant-time comparison to prevent timing attacks
            boolean valid = constantTimeEquals(calculated, receivedHmac);
            if (!valid) {
                log.warn("[Paymob] HMAC mismatch — calculated={}, received={}", calculated, receivedHmac);
            }
            return valid;

        } catch (Exception e) {
            log.error("[Paymob] HMAC verification error", e);
            return false;
        }
    }

    /** Computes HMAC-SHA512 and returns a lowercase hex string. */
    private String hmacSha512(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA512");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
        byte[] raw = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder(raw.length * 2);
        for (byte b : raw) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    /**
     * Constant-time string comparison — prevents timing side-channel attacks
     * where an attacker could deduce bytes of the correct HMAC by measuring
     * response time differences.
     */
    private boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) return false;
        byte[] aBytes = a.toLowerCase().getBytes(StandardCharsets.UTF_8);
        byte[] bBytes = b.toLowerCase().getBytes(StandardCharsets.UTF_8);
        if (aBytes.length != bBytes.length) return false;
        int diff = 0;
        for (int i = 0; i < aBytes.length; i++) diff |= aBytes[i] ^ bBytes[i];
        return diff == 0;
    }

    // ── PRIVATE — Utility Helpers ───────────────────────────────────────────

    private HttpEntity<Map<String, Object>> jsonRequest(Map<String, Object> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(body, headers);
    }

    private void validateResponse(ResponseEntity<?> response, String step) {
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new PaymentException(
                String.format("Paymob %s step failed — HTTP %s", step, response.getStatusCode()));
        }
    }

    private Map<String, Object> billingDataToMap(BillingData bd) {
        Map<String, Object> m = new HashMap<>();
        m.put("first_name",      safeStr(bd.getFirstName()));
        m.put("last_name",       safeStr(bd.getLastName()));
        m.put("email",           safeStr(bd.getEmail()));
        m.put("phone_number",    safeStr(bd.getPhoneNumber()));
        m.put("apartment",       safeStr(bd.getApartment()));
        m.put("floor",           safeStr(bd.getFloor()));
        m.put("street",          safeStr(bd.getStreet()));
        m.put("building",        safeStr(bd.getBuilding()));
        m.put("shipping_method", safeStr(bd.getShippingMethod()));
        m.put("postal_code",     safeStr(bd.getPostalCode()));
        m.put("city",            safeStr(bd.getCity()));
        m.put("country",         safeStr(bd.getCountry()));
        m.put("state",           safeStr(bd.getState()));
        return m;
    }

    private String buildIframeUrl(String paymentKey) {
        return String.format(
            "https://accept.paymob.com/api/acceptance/iframes/%d?payment_token=%s",
            paymobConfig.getIframeId(),
            paymentKey
        );
    }

    /** Returns value or "NA" — Paymob rejects null billing fields. */
    private String safeStr(String v) {
        return (v != null && !v.isBlank()) ? v : "NA";
    }

    // ── Custom Exceptions ───────────────────────────────────────────────────

    /** Thrown when a Paymob API call fails. Converted to 500 by the controller. */
    public static class PaymentException extends RuntimeException {
        public PaymentException(String msg)                  { super(msg); }
        public PaymentException(String msg, Throwable cause) { super(msg, cause); }
    }

    /** Thrown when a webhook is received for an already-processed transaction. */
    public static class AlreadyProcessedException extends RuntimeException {
        public AlreadyProcessedException(String msg) { super(msg); }
    }
}
