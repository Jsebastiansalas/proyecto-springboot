package com.renta.application.dto.report;

import java.math.BigDecimal;

public record RevenueMetricDto(
        String period,
        BigDecimal amount,
        long transactionCount
) {}
