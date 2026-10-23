package com.renta.domain.service;

import com.renta.domain.model.vo.LateReturnSettlement;
import com.renta.domain.model.vo.Money;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Servicio de dominio puro para liquidar penalizaciones por devolución extemporánea (mora).
 */
public final class LateReturnPolicy {

    public static final BigDecimal DEFAULT_PENALTY_MULTIPLIER = BigDecimal.valueOf(1.50);

    private LateReturnPolicy() {
    }

    public static LateReturnSettlement evaluate(
            LocalDate expectedEndDate,
            LocalDate actualReturnDate,
            Money dailyRate,
            Money initialDeposit) {
        return evaluate(expectedEndDate, actualReturnDate, dailyRate, initialDeposit, DEFAULT_PENALTY_MULTIPLIER);
    }

    public static LateReturnSettlement evaluate(
            LocalDate expectedEndDate,
            LocalDate actualReturnDate,
            Money dailyRate,
            Money initialDeposit,
            BigDecimal penaltyMultiplier) {

        Money deposit = initialDeposit != null ? initialDeposit : Money.zero();
        Money rate = dailyRate != null ? dailyRate : Money.zero();
        BigDecimal multiplier = penaltyMultiplier != null ? penaltyMultiplier : DEFAULT_PENALTY_MULTIPLIER;

        if (actualReturnDate == null || !actualReturnDate.isAfter(expectedEndDate)) {
            return new LateReturnSettlement(
                    0,
                    rate,
                    multiplier,
                    Money.zero(),
                    deposit,
                    deposit,
                    Money.zero(),
                    "Devolución a tiempo. No aplica recargo moratorio."
            );
        }

        int daysLate = (int) ChronoUnit.DAYS.between(expectedEndDate, actualReturnDate);
        Money baseLateAmount = rate.multiply(daysLate);
        Money penaltyAmount = Money.of(baseLateAmount.amount().multiply(multiplier));

        Money refund;
        Money debt;
        if (penaltyAmount.amount().compareTo(deposit.amount()) <= 0) {
            refund = deposit.subtract(penaltyAmount);
            debt = Money.zero();
        } else {
            refund = Money.zero();
            debt = penaltyAmount.subtract(deposit);
        }

        String explanation = String.format(
                "Devolución con %d días de retraso. Penalidad aplicada al %s%% sobre la tarifa diaria ($%s/día). Total multa: $%s.",
                daysLate,
                multiplier.multiply(BigDecimal.valueOf(100)).stripTrailingZeros().toPlainString(),
                rate.amount().toPlainString(),
                penaltyAmount.amount().toPlainString()
        );

        return new LateReturnSettlement(
                daysLate,
                rate,
                multiplier,
                penaltyAmount,
                deposit,
                refund,
                debt,
                explanation
        );
    }
}
