package com.packora.backend.controller;

import com.packora.backend.dto.admin.AdminDashboardResponse;
import com.packora.backend.dto.admin.RevenueChartResponse;
import com.packora.backend.dto.admin.TopProductResponse;
import com.packora.backend.service.AdminAnalyticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/analytics")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAnalyticsController {

    private static final Logger log = LoggerFactory.getLogger(AdminAnalyticsController.class);

    private final AdminAnalyticsService adminAnalyticsService;

    public AdminAnalyticsController(AdminAnalyticsService adminAnalyticsService) {
        this.adminAnalyticsService = adminAnalyticsService;
    }

    /**
     * Gets the full dashboard payload (stats, top products, recent orders) to minimize requests.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getFullDashboard() {
        log.info("[AdminAnalyticsController] GET /api/admin/analytics/dashboard");
        return ResponseEntity.ok(adminAnalyticsService.getFullDashboard());
    }

    /**
     * Gets revenue and order time-series data for charts.
     */
    @GetMapping("/revenue-chart")
    public ResponseEntity<List<RevenueChartResponse>> getRevenueChart(
            @RequestParam(defaultValue = "6") int months) {
        log.info("[AdminAnalyticsController] GET /api/admin/analytics/revenue-chart?months={}", months);
        return ResponseEntity.ok(adminAnalyticsService.getRevenueChart(months));
    }

    /**
     * Gets top performing products based on order volume.
     */
    @GetMapping("/top-products")
    public ResponseEntity<List<TopProductResponse>> getTopProducts(
            @RequestParam(defaultValue = "5") int limit) {
        log.info("[AdminAnalyticsController] GET /api/admin/analytics/top-products?limit={}", limit);
        return ResponseEntity.ok(adminAnalyticsService.getTopProducts(limit));
    }
}
