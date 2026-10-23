package com.renta.application.dto.delivery;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LateReturnSettlementResponse(
        Long reservationId,
        String reservationCode,
        LocalDate expectedEndDate,
        LocalDate actualReturnDate,
        int daysLate,
        BigDecimal dailyRate,
        BigDecimal penaltyMultiplier,
        BigDecimal latePenaltyAmount,
        BigDecimal initialDeposit,
        BigDecimal refundAmount,
        BigDecimal pendingDebt,
        String explanation
) {}
