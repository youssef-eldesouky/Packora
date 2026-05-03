package com.packora.backend.payment.service;

import com.packora.backend.model.Order;
import com.packora.backend.model.Payment;
import com.packora.backend.model.enums.PaymentStatus;
import com.packora.backend.payment.config.PaymobConfig;
import com.packora.backend.payment.dto.*;
import com.packora.backend.repository.OrderRepository;
import com.packora.backend.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * PaymobService — orchestrates the Paymob Accept API 3-step payment flow:
 *
 *  Step 1 → POST /auth/tokens           : authenticate → get auth_token
 *  Step 2 → POST /ecommerce/orders      : register order → get paymob_order_id
 *  Step 3 → POST /acceptance/payment_keys : get payment key → build iframe URL
 *
 * Also handles:
 *  - Webhook callback processing (update Payment entity status)
 *  - HMAC-SHA512 signature verification for security
 */
@Service
public class PaymobService {

    private static final Logger log = LoggerFactory.getLogger(PaymobService.class);

    private final PaymobConfig paymobConfig;
    private final RestTemplate restTemplate;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    public PaymobService(PaymobConfig paymobConfig,
                         RestTemplate restTemplate,
                         OrderRepository orderRepository,
                         PaymentRepository paymentRepository) {
        this.paymobConfig = paymobConfig;
        this.restTemplate = restTemplate;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
    }

    // ── PUBLIC API ─────────────────────────────────────────────────────────

    /**
     * Executes the full Paymob 3-step flow and returns a PaymentInitResponse
     * containing the iframe URL ready for the frontend to embed.
     *
     * @param orderId     our internal Packora order ID
     * @param amountEGP   total amount in EGP (will be converted to cents)
     * @param billingData buyer billing info required by Paymob
     * @return PaymentInitResponse with iframeUrl, paymentKey, paymobOrderId
     */
    public PaymentInitResponse initiatePayment(Long orderId, Double amountEGP, BillingData billingData) {
        log.info("[Paymob] Initiating payment for Packora order ID: {}", orderId);

        // ── Step 1: Authenticate ───────────────────────────────────────────
        String authToken = authenticate();
        log.info("[Paymob] Step 1 complete — auth token obtained");

        // ── Step 2: Register order ─────────────────────────────────────────
        long amountCents = Math.round(amountEGP * 100);
        Long paymobOrderId = registerOrder(authToken, orderId, amountCents);
        log.info("[Paymob] Step 2 complete — Paymob order ID: {}", paymobOrderId);

        // ── Step 3: Get payment key ────────────────────────────────────────
        String paymentKey = getPaymentKey(authToken, paymobOrderId, amountCents, billingData);
        log.info("[Paymob] Step 3 complete — payment key obtained");

        // ── Build iframe URL ───────────────────────────────────────────────
        String iframeUrl = buildIframeUrl(paymentKey);
        log.info("[Paymob] iframe URL built: {}", iframeUrl);

        // ── Persist a PENDING payment record ──────────────────────────────
        persistPendingPayment(orderId, amountEGP, paymobOrderId);

        return new PaymentInitResponse(iframeUrl, paymentKey, paymobOrderId);
    }

    /**
     * Processes an incoming Paymob webhook callback.
     * 1. Verifies HMAC signature (rejects tampered requests).
     * 2. Updates the Payment entity status based on success/failure.
     *
     * @param payload   parsed callback JSON body
     * @param hmacValue HMAC signature from query param ?hmac=...
     */
    public void processCallback(PaymobCallbackPayload payload, String hmacValue) {
        // Security: verify HMAC before touching the database
        if (!verifyHmac(payload, hmacValue)) {
            log.warn("[Paymob] HMAC verification FAILED — callback rejected");
            throw new SecurityException("Invalid Paymob HMAC signature");
        }

        PaymobCallbackPayload.TransactionObj txn = payload.getObj();
        if (txn == null) {
            log.warn("[Paymob] Callback received with null transaction object — skipping");
            return;
        }

        String paymobTxnId = String.valueOf(txn.getId());
        boolean success = txn.isSuccess();

        log.info("[Paymob] Callback received — txnId: {}, success: {}", paymobTxnId, success);

        // Look up payment by Paymob transaction ID OR by merchant_order_id
        paymentRepository.findByTransactionId(paymobTxnId).ifPresentOrElse(
            payment -> updatePaymentStatus(payment, success, txn),
            () -> {
                // Payment not yet persisted with a txn ID — try by
                // merchantOrderId (our internal order ID stored in merchant_order_id)
                if (txn.getOrder() != null && txn.getOrder().getMerchantOrderId() != null) {
                    String merchantOrderId = txn.getOrder().getMerchantOrderId();
                    try {
                        Long packOrderId = Long.parseLong(merchantOrderId);
                        List<Payment> pendingPayments = paymentRepository.findByOrderId(packOrderId)
                                .stream()
                                .filter(p -> p.getStatus() == PaymentStatus.PENDING)
                                .toList();
                        if (!pendingPayments.isEmpty()) {
                            updatePaymentStatus(pendingPayments.get(0), success, txn);
                        }
                    } catch (NumberFormatException e) {
                        log.warn("[Paymob] Could not parse merchantOrderId '{}' as Long", merchantOrderId);
                    }
                } else {
                    log.warn("[Paymob] No matching payment found for txnId: {}", paymobTxnId);
                }
            }
        );
    }

    // ── PRIVATE — Paymob Step 1: Authentication ────────────────────────────

    @SuppressWarnings("unchecked")
    private String authenticate() {
        String url = paymobConfig.getBaseUrl() + "/auth/tokens";

        Map<String, Object> body = new HashMap<>();
        body.put("api_key", paymobConfig.getApiKey());

        ResponseEntity<Map> response = restTemplate.postForEntity(url, buildRequest(body), Map.class);
        validateResponse(response, "authentication");

        String token = (String) response.getBody().get("token");
        if (token == null || token.isBlank()) {
            throw new RuntimeException("[Paymob] Authentication failed — no token in response");
        }
        return token;
    }

    // ── PRIVATE — Paymob Step 2: Order Registration ────────────────────────

    @SuppressWarnings("unchecked")
    private Long registerOrder(String authToken, Long packOrderId, long amountCents) {
        String url = paymobConfig.getBaseUrl() + "/ecommerce/orders";

        Map<String, Object> body = new HashMap<>();
        body.put("auth_token", authToken);
        body.put("delivery_needed", false);
        body.put("amount_cents", amountCents);
        body.put("currency", "EGP");
        body.put("merchant_order_id", String.valueOf(packOrderId)); // our internal ID as reference
        body.put("items", List.of()); // empty items list is acceptable

        ResponseEntity<Map> response = restTemplate.postForEntity(url, buildRequest(body), Map.class);
        validateResponse(response, "order registration");

        Object idObj = response.getBody().get("id");
        if (idObj == null) {
            throw new RuntimeException("[Paymob] Order registration failed — no id in response");
        }
        return Long.parseLong(idObj.toString());
    }

    // ── PRIVATE — Paymob Step 3: Payment Key ──────────────────────────────

    @SuppressWarnings("unchecked")
    private String getPaymentKey(String authToken, Long paymobOrderId,
                                  long amountCents, BillingData billingData) {
        String url = paymobConfig.getBaseUrl() + "/acceptance/payment_keys";

        Map<String, Object> body = new HashMap<>();
        body.put("auth_token", authToken);
        body.put("expiration", 3600);           // 1 hour expiry
        body.put("order_id", paymobOrderId);
        body.put("billing_data", billingDataToMap(billingData));
        body.put("amount_cents", amountCents);
        body.put("currency", "EGP");
        body.put("integration_id", paymobConfig.getIntegrationId());

        ResponseEntity<Map> response = restTemplate.postForEntity(url, buildRequest(body), Map.class);
        validateResponse(response, "payment key");

        String token = (String) response.getBody().get("token");
        if (token == null || token.isBlank()) {
            throw new RuntimeException("[Paymob] Payment key request failed — no token in response");
        }
        return token;
    }

    // ── PRIVATE — Helpers ──────────────────────────────────────────────────

    /** Constructs the Paymob iFrame URL from the payment key */
    private String buildIframeUrl(String paymentKey) {
        return String.format(
            "https://accept.paymob.com/api/acceptance/iframes/%d?payment_token=%s",
            paymobConfig.getIframeId(),
            paymentKey
        );
    }

    /** Wraps a map body into an HttpEntity with JSON headers */
    private HttpEntity<Map<String, Object>> buildRequest(Map<String, Object> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(body, headers);
    }

    /** Wraps a string body into an HttpEntity with JSON headers */
    @SuppressWarnings("unused")
    private <T> HttpEntity<T> buildRequest(T body, HttpHeaders headers) {
        return new HttpEntity<>(body, headers);
    }

    /** Validates that a Paymob response is 2xx and has a body */
    private void validateResponse(ResponseEntity<?> response, String step) {
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new RuntimeException(
                String.format("[Paymob] %s step failed — HTTP %s", step, response.getStatusCode())
            );
        }
    }

    /** Converts BillingData to a Map (for embedding in the payment key request body) */
    private Map<String, Object> billingDataToMap(BillingData bd) {
        Map<String, Object> map = new HashMap<>();
        map.put("first_name",       safeStr(bd.getFirstName()));
        map.put("last_name",        safeStr(bd.getLastName()));
        map.put("email",            safeStr(bd.getEmail()));
        map.put("phone_number",     safeStr(bd.getPhoneNumber()));
        map.put("apartment",        safeStr(bd.getApartment()));
        map.put("floor",            safeStr(bd.getFloor()));
        map.put("street",           safeStr(bd.getStreet()));
        map.put("building",         safeStr(bd.getBuilding()));
        map.put("shipping_method",  safeStr(bd.getShippingMethod()));
        map.put("postal_code",      safeStr(bd.getPostalCode()));
        map.put("city",             safeStr(bd.getCity()));
        map.put("country",          safeStr(bd.getCountry()));
        map.put("state",            safeStr(bd.getState()));
        return map;
    }

    /** Returns value or "NA" if null/blank (Paymob requires all billing fields to be non-null) */
    private String safeStr(String value) {
        return (value != null && !value.isBlank()) ? value : "NA";
    }

    /** Creates a PENDING Payment entity in the database when a payment is initiated */
    private void persistPendingPayment(Long orderId, Double amountEGP, Long paymobOrderId) {
        orderRepository.findById(orderId).ifPresent(order -> {
            Payment payment = new Payment();
            payment.setOrder(order);
            payment.setAmount(amountEGP);
            payment.setMethod("CARD");
            payment.setStatus(PaymentStatus.PENDING);
            payment.setTransactionId("PAYMOB_ORDER_" + paymobOrderId); // placeholder until callback
            paymentRepository.save(payment);
            log.info("[Paymob] Pending payment record saved for order {}", orderId);
        });
    }

    /** Updates a Payment entity status based on Paymob callback result */
    private void updatePaymentStatus(Payment payment,
                                      boolean success,
                                      PaymobCallbackPayload.TransactionObj txn) {
        String paymobTxnId = String.valueOf(txn.getId());

        if (txn.isVoided()) {
            payment.setStatus(PaymentStatus.REFUNDED);
        } else if (txn.isRefunded()) {
            payment.setStatus(PaymentStatus.REFUNDED);
        } else if (success) {
            payment.setStatus(PaymentStatus.COMPLETED);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }

        payment.setTransactionId(paymobTxnId); // update with the real Paymob transaction ID
        paymentRepository.save(payment);

        log.info("[Paymob] Payment {} updated → status: {}", paymobTxnId, payment.getStatus());
    }

    // ── PRIVATE — HMAC Verification ────────────────────────────────────────

    /**
     * Verifies the Paymob HMAC-SHA512 signature.
     *
     * Paymob concatenates specific transaction fields (in strict order)
     * and hashes them with your HMAC secret using SHA-512.
     * We replicate the same calculation and compare against the received signature.
     *
     * Field order (Paymob official spec):
     *   amount_cents, created_at, currency, error_occured, has_parent_transaction,
     *   id, integration_id, is_3d_secure, is_auth, is_capture, is_refunded,
     *   is_standalone_payment, is_voided, order.id, owner, pending,
     *   source_data.pan, source_data.sub_type, source_data.type, success
     */
    private boolean verifyHmac(PaymobCallbackPayload payload, String receivedHmac) {
        if (receivedHmac == null || receivedHmac.isBlank()) {
            log.warn("[Paymob] No HMAC provided in callback query params");
            return false;
        }

        try {
            PaymobCallbackPayload.TransactionObj t = payload.getObj();
            if (t == null) return false;

            String pan     = t.getSourceData() != null ? safeStr(t.getSourceData().getPan())     : "NA";
            String subType = t.getSourceData() != null ? safeStr(t.getSourceData().getSubType()) : "NA";
            String srcType = t.getSourceData() != null ? safeStr(t.getSourceData().getType())    : "NA";
            String orderId = t.getOrder() != null ? String.valueOf(t.getOrder().getId()) : "NA";

            // Concatenate fields in the exact order Paymob specifies
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
            boolean valid = calculated.equalsIgnoreCase(receivedHmac);

            if (!valid) {
                log.warn("[Paymob] HMAC mismatch — expected: {}, received: {}", calculated, receivedHmac);
            }
            return valid;

        } catch (Exception e) {
            log.error("[Paymob] HMAC verification error", e);
            return false;
        }
    }

    /** Computes HMAC-SHA512 and returns it as a lowercase hex string */
    private String hmacSha512(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA512");
        SecretKeySpec keySpec = new SecretKeySpec(
            secret.getBytes(StandardCharsets.UTF_8), "HmacSHA512"
        );
        mac.init(keySpec);
        byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

        StringBuilder sb = new StringBuilder();
        for (byte b : rawHmac) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
