package com.renta.application.dto.report;

import java.math.BigDecimal;
import java.util.List;

public record AdminDashboardResponse(
        long totalUsers,
        long totalClients,
        long totalProviders,
        long totalTools,
        long totalReservations,
        long activeRentals,
        BigDecimal totalRevenue,
        BigDecimal totalDepositsHeld,
        List<ToolPopularityDto> topRentedTools,
        List<RevenueMetricDto> monthlyRevenue,
        List<FrequentClientDto> topFrequentClients
) {
    public AdminDashboardResponse(
            long totalUsers,
            long totalClients,
            long totalProviders,
            long totalTools,
            long totalReservations,
            long activeRentals,
            BigDecimal totalRevenue,
            BigDecimal totalDepositsHeld,
            List<ToolPopularityDto> topRentedTools,
            List<RevenueMetricDto> monthlyRevenue) {
        this(totalUsers, totalClients, totalProviders, totalTools, totalReservations, activeRentals, totalRevenue, totalDepositsHeld, topRentedTools, monthlyRevenue, List.of());
    }
}
