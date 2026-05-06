package com.packora.backend.dto.admin;

import com.packora.backend.dto.order.OrderResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private DashboardStatsResponse stats;
    private List<TopProductResponse> topProducts;
    private List<OrderResponse> recentOrders;
}
