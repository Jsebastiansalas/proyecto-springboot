package com.renta.application.dto.reservation;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PriceCalculationResponse(
        Long toolId,
        String toolName,
        LocalDate startDate,
        LocalDate endDate,
        int totalDays,
        BigDecimal baseDailyPrice,
        BigDecimal effectiveDailyPrice,
        boolean weeklyDiscountApplied,
        BigDecimal subtotal,
        BigDecimal taxAmount, // IVA 19%
        BigDecimal depositAmount,
        BigDecimal totalAmount
) {}
