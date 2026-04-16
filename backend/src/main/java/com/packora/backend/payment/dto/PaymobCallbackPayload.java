package com.packora.backend.payment.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Represents the transaction callback payload sent by Paymob to our webhook endpoint.
 * Paymob wraps all transaction data inside an "obj" field.
 *
 * HMAC is verified against specific fields of this object before processing.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaymobCallbackPayload {

    /** Wraps the full transaction object sent by Paymob */
    @JsonProperty("obj")
    private TransactionObj obj;

    /** Type of event, e.g. "TRANSACTION" */
    @JsonProperty("type")
    private String type;

    public TransactionObj getObj() { return obj; }
    public void setObj(TransactionObj obj) { this.obj = obj; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    // ── Inner class: TransactionObj ──────────────────────────────────────────

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TransactionObj {

        @JsonProperty("id")
        private Long id;

        @JsonProperty("pending")
        private boolean pending;

        @JsonProperty("amount_cents")
        private Long amountCents;

        @JsonProperty("success")
        private boolean success;

        @JsonProperty("is_auth")
        private boolean isAuth;

        @JsonProperty("is_capture")
        private boolean isCapture;

        @JsonProperty("is_standalone_payment")
        private boolean isStandalonePayment;

        @JsonProperty("is_voided")
        private boolean isVoided;

        @JsonProperty("is_refunded")
        private boolean isRefunded;

        @JsonProperty("is_3d_secure")
        private boolean is3dSecure;

        @JsonProperty("error_occured")
        private boolean errorOccured;

        @JsonProperty("has_parent_transaction")
        private boolean hasParentTransaction;

        @JsonProperty("currency")
        private String currency;

        @JsonProperty("created_at")
        private String createdAt;

        @JsonProperty("integration_id")
        private Long integrationId;

        @JsonProperty("owner")
        private Long owner;

        /** Paymob order object (contains id and merchant_order_id) */
        @JsonProperty("order")
        private OrderRef order;

        /** Source data (card type, masked PAN, etc.) */
        @JsonProperty("source_data")
        private SourceData sourceData;

        // ── Getters & Setters ────────────────────────────────────────────────

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public boolean isPending() { return pending; }
        public void setPending(boolean pending) { this.pending = pending; }

        public Long getAmountCents() { return amountCents; }
        public void setAmountCents(Long amountCents) { this.amountCents = amountCents; }

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        public boolean isAuth() { return isAuth; }
        public void setAuth(boolean auth) { isAuth = auth; }

        public boolean isCapture() { return isCapture; }
        public void setCapture(boolean capture) { isCapture = capture; }

        public boolean isStandalonePayment() { return isStandalonePayment; }
        public void setStandalonePayment(boolean standalonePayment) { isStandalonePayment = standalonePayment; }

        public boolean isVoided() { return isVoided; }
        public void setVoided(boolean voided) { isVoided = voided; }

        public boolean isRefunded() { return isRefunded; }
        public void setRefunded(boolean refunded) { isRefunded = refunded; }

        public boolean is3dSecure() { return is3dSecure; }
        public void set3dSecure(boolean is3dSecure) { this.is3dSecure = is3dSecure; }

        public boolean isErrorOccured() { return errorOccured; }
        public void setErrorOccured(boolean errorOccured) { this.errorOccured = errorOccured; }

        public boolean isHasParentTransaction() { return hasParentTransaction; }
        public void setHasParentTransaction(boolean hasParentTransaction) { this.hasParentTransaction = hasParentTransaction; }

        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }

        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

        public Long getIntegrationId() { return integrationId; }
        public void setIntegrationId(Long integrationId) { this.integrationId = integrationId; }

        public Long getOwner() { return owner; }
        public void setOwner(Long owner) { this.owner = owner; }

        public OrderRef getOrder() { return order; }
        public void setOrder(OrderRef order) { this.order = order; }

        public SourceData getSourceData() { return sourceData; }
        public void setSourceData(SourceData sourceData) { this.sourceData = sourceData; }
    }

    // ── Inner class: OrderRef ────────────────────────────────────────────────

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class OrderRef {

        @JsonProperty("id")
        private Long id;

        /** Our internal Packora order ID passed as merchant_order_id */
        @JsonProperty("merchant_order_id")
        private String merchantOrderId;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getMerchantOrderId() { return merchantOrderId; }
        public void setMerchantOrderId(String merchantOrderId) { this.merchantOrderId = merchantOrderId; }
    }

    // ── Inner class: SourceData ──────────────────────────────────────────────

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SourceData {

        @JsonProperty("pan")
        private String pan;

        @JsonProperty("type")
        private String type;

        @JsonProperty("sub_type")
        private String subType;

        public String getPan() { return pan; }
        public void setPan(String pan) { this.pan = pan; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getSubType() { return subType; }
        public void setSubType(String subType) { this.subType = subType; }
    }
}
