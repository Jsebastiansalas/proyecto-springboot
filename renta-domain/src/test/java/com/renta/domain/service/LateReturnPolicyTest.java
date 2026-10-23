package com.renta.domain.service;

import com.renta.domain.model.vo.LateReturnSettlement;
import com.renta.domain.model.vo.Money;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Pruebas Unitarias de Dominio: Política de Devolución Tardía (LateReturnPolicy)")
class LateReturnPolicyTest {

    @Test
    @DisplayName("Devolución a tiempo o antes: no aplica mora y devuelve 100% de la fianza")
    void shouldNotChargePenaltyWhenReturnedOnTime() {
        LocalDate expectedEnd = LocalDate.of(2026, 11, 10);
        LocalDate actualReturn = LocalDate.of(2026, 11, 10);
        Money dailyRate = Money.of(100000);
        Money deposit = Money.of(300000);

        LateReturnSettlement settlement = LateReturnPolicy.evaluate(expectedEnd, actualReturn, dailyRate, deposit);

        assertFalse(settlement.hasPenalty());
        assertEquals(0, settlement.daysLate());
        assertEquals(0, BigDecimal.ZERO.compareTo(settlement.latePenaltyAmount().amount()));
        assertEquals(0, deposit.amount().compareTo(settlement.refundAmount().amount()));
        assertEquals(0, BigDecimal.ZERO.compareTo(settlement.pendingDebt().amount()));
    }

    @Test
    @DisplayName("Devolución con retraso cubierto por la fianza: descuenta penalidad y reembolsa diferencia")
    void shouldDeductPenaltyFromDepositWhenCovered() {
        LocalDate expectedEnd = LocalDate.of(2026, 11, 10);
        LocalDate actualReturn = LocalDate.of(2026, 11, 11); // 1 día de retraso
        Money dailyRate = Money.of(100000); // Tarifa: 100k
        Money deposit = Money.of(300000);   // Fianza: 300k
        // Penalidad: 1 día * 100.000 * 1.5 = 150.000 COP
        // Reembolso: 300.000 - 150.000 = 150.000 COP

        LateReturnSettlement settlement = LateReturnPolicy.evaluate(expectedEnd, actualReturn, dailyRate, deposit);

        assertTrue(settlement.hasPenalty());
        assertEquals(1, settlement.daysLate());
        assertEquals(0, settlement.latePenaltyAmount().amount().compareTo(BigDecimal.valueOf(150000)));
        assertEquals(0, settlement.refundAmount().amount().compareTo(BigDecimal.valueOf(150000)));
        assertEquals(0, BigDecimal.ZERO.compareTo(settlement.pendingDebt().amount()));
    }

    @Test
    @DisplayName("Devolución con retraso que excede la fianza: fianza en 0 y genera saldo pendiente por cobrar")
    void shouldGeneratePendingDebtWhenPenaltyExceedsDeposit() {
        LocalDate expectedEnd = LocalDate.of(2026, 11, 10);
        LocalDate actualReturn = LocalDate.of(2026, 11, 13); // 3 días de retraso
        Money dailyRate = Money.of(100000); // Tarifa: 100k
        Money deposit = Money.of(300000);   // Fianza: 300k
        // Penalidad: 3 días * 100.000 * 1.5 = 450.000 COP
        // Fianza retenida al 100% -> Reembolso: 0 COP
        // Saldo por cobrar (deuda): 450.000 - 300.000 = 150.000 COP

        LateReturnSettlement settlement = LateReturnPolicy.evaluate(expectedEnd, actualReturn, dailyRate, deposit);

        assertTrue(settlement.hasPenalty());
        assertEquals(3, settlement.daysLate());
        assertEquals(0, settlement.latePenaltyAmount().amount().compareTo(BigDecimal.valueOf(450000)));
        assertEquals(0, BigDecimal.ZERO.compareTo(settlement.refundAmount().amount()));
        assertEquals(0, settlement.pendingDebt().amount().compareTo(BigDecimal.valueOf(150000)));
    }
}
