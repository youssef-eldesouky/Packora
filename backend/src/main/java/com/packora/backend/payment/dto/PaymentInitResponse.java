package com.packora.backend.payment.dto;

/**
 * Response sent back to the frontend after our backend completes the Paymob 3-step flow.
 * The frontend should embed the iframeUrl in an <iframe> or redirect the user to it.
 */
public class PaymentInitResponse {

    /** Fully constructed Paymob iframe URL — ready to embed in the frontend */
    private String iframeUrl;

    /** Paymob payment key (for reference / debugging) */
    private String paymentKey;

    /** Paymob's internal order ID (for reference / debugging) */
    private Long paymobOrderId;

    // ── Constructors ─────────────────────────────────────────────────────────

    public PaymentInitResponse() {}

    public PaymentInitResponse(String iframeUrl, String paymentKey, Long paymobOrderId) {
        this.iframeUrl = iframeUrl;
        this.paymentKey = paymentKey;
        this.paymobOrderId = paymobOrderId;
    }

    // ── Getters & Setters ────────────────────────────────────────────────────

    public String getIframeUrl() { return iframeUrl; }
    public void setIframeUrl(String iframeUrl) { this.iframeUrl = iframeUrl; }

    public String getPaymentKey() { return paymentKey; }
    public void setPaymentKey(String paymentKey) { this.paymentKey = paymentKey; }

    public Long getPaymobOrderId() { return paymobOrderId; }
    public void setPaymobOrderId(Long paymobOrderId) { this.paymobOrderId = paymobOrderId; }
}
