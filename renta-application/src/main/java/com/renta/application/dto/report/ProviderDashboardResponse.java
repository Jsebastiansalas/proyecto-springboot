package com.renta.application.dto.report;

import java.math.BigDecimal;
import java.util.List;

public record ProviderDashboardResponse(
        Long providerId,
        String companyName,
        long totalTools,
        long availableTools,
        long rentedTools,
        long maintenanceTools,
        long totalReservations,
        BigDecimal totalEarned,
        List<ToolPopularityDto> topTools
) {}
