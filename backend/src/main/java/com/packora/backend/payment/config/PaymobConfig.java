package com.packora.backend.payment.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Paymob configuration — reads paymob.* properties from application.properties.
 * All credentials are injected via Spring so nothing is hard-coded.
 */
@Configuration
@ConfigurationProperties(prefix = "paymob")
public class PaymobConfig {

    /** Paymob API key (from Dashboard → Settings → Account Info) */
    private String apiKey;

    /** Paymob Integration ID (from Dashboard → Developers → Payment Integrations) */
    private int integrationId;

    /** iFrame ID (from Dashboard → Developers → iFrames) */
    private int iframeId;

    /** HMAC secret used to verify Paymob callback authenticity */
    private String hmacSecret;

    /** Base URL for Paymob Accept API */
    private String baseUrl = "https://accept.paymob.com/api";

    // ── getters & setters ───────────────────────────────────────────────────

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public int getIntegrationId() {
        return integrationId;
    }

    public void setIntegrationId(int integrationId) {
        this.integrationId = integrationId;
    }

    public int getIframeId() {
        return iframeId;
    }

    public void setIframeId(int iframeId) {
        this.iframeId = iframeId;
    }

    public String getHmacSecret() {
        return hmacSecret;
    }

    public void setHmacSecret(String hmacSecret) {
        this.hmacSecret = hmacSecret;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    // ── beans ───────────────────────────────────────────────────────────────

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
