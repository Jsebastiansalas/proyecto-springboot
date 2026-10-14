package com.renta.application.dto.report;

import java.math.BigDecimal;

public record ToolPopularityDto(
        Long toolId,
        String toolName,
        String brand,
        String categoryName,
        long rentalCount,
        BigDecimal totalRevenue
) {}
