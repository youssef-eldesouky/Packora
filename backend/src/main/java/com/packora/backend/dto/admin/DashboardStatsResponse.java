package com.packora.backend.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private Double totalRevenue;
    private Long totalOrders;
    private Long activeCustomers;
    private Long productCount;
}
