package com.packora.backend.payment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Request body that the frontend sends to our backend to initiate a Paymob payment.
 * Our backend then orchestrates the 3-step Paymob flow and returns an iFrame URL.
 */
public class PaymentInitRequest {

    /** Internal Packora order ID — used as merchant_order_id with Paymob */
    @NotNull(message = "orderId is required")
    @JsonProperty("orderId")
    private Long orderId;

    /** Amount in EGP (we multiply by 100 to get amount_cents for Paymob) */
    @NotNull(message = "amount is required")
    @Positive(message = "amount must be positive")
    @JsonProperty("amount")
    private Double amount;

    /** Buyer billing information required by Paymob */
    @NotNull(message = "billingData is required")
    @Valid
    @JsonProperty("billingData")
    private BillingData billingData;

    // ── Constructors ─────────────────────────────────────────────────────────

    public PaymentInitRequest() {}

    public PaymentInitRequest(Long orderId, Double amount, BillingData billingData) {
        this.orderId = orderId;
        this.amount = amount;
        this.billingData = billingData;
    }

    // ── Getters & Setters ────────────────────────────────────────────────────

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public BillingData getBillingData() { return billingData; }
    public void setBillingData(BillingData billingData) { this.billingData = billingData; }
}
