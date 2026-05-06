package com.packora.backend.service;

import com.packora.backend.dto.admin.AdminDashboardResponse;
import com.packora.backend.dto.admin.DashboardStatsResponse;
import com.packora.backend.dto.admin.RevenueChartResponse;
import com.packora.backend.dto.admin.TopProductResponse;

import java.util.List;

public interface AdminAnalyticsService {

    DashboardStatsResponse getDashboardStats();

    List<RevenueChartResponse> getRevenueChart(int months);

    List<TopProductResponse> getTopProducts(int limit);

    AdminDashboardResponse getFullDashboard();
}
