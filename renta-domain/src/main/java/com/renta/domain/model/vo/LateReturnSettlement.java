package com.renta.domain.model.vo;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Value Object inmutable que representa la liquidación financiera por devolución tardía (mora).
 */
public record LateReturnSettlement(
        int daysLate,
        Money dailyRate,
        BigDecimal penaltyMultiplier,
        Money latePenaltyAmount,
        Money initialDeposit,
        Money refundAmount,
        Money pendingDebt,
        String explanation
) {
    public LateReturnSettlement {
        Objects.requireNonNull(dailyRate, "dailyRate es obligatorio");
        Objects.requireNonNull(penaltyMultiplier, "penaltyMultiplier es obligatorio");
        Objects.requireNonNull(latePenaltyAmount, "latePenaltyAmount es obligatorio");
        Objects.requireNonNull(initialDeposit, "initialDeposit es obligatorio");
        Objects.requireNonNull(refundAmount, "refundAmount es obligatorio");
        Objects.requireNonNull(pendingDebt, "pendingDebt es obligatorio");
        Objects.requireNonNull(explanation, "explanation es obligatorio");
    }

    public boolean hasPenalty() {
        return daysLate > 0;
    }
}
