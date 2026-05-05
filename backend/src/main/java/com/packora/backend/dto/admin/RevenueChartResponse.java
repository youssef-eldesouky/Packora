package com.packora.backend.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevenueChartResponse {
    private String month;
    private Long orders;
    private Double revenue;
}
