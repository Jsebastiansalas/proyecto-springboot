package com.renta.domain.model.vo;

import com.renta.domain.exception.BusinessRuleViolationException;
import com.renta.domain.model.enums.SettlementStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("DepositSettlement Value Object Domain Invariant Tests")
class DepositSettlementTest {

    @Test
    @DisplayName("Sin daños reportados debe reembolsar 100% de la garantía")
    void shouldRefundFullDepositWhenNoDamage() {
        Money deposit = Money.cop(200_000);
        Money damage = Money.zero();

        DepositSettlement settlement = DepositSettlement.calculate(deposit, damage);

        assertEquals(SettlementStatus.REEMBOLSO_TOTAL, settlement.status());
        assertEquals(Money.cop(200_000), settlement.refundAmount());
        assertEquals(Money.zero(), settlement.extraChargeDue());
        assertEquals(Money.cop(200_000), settlement.initialDeposit());
        assertEquals(Money.zero(), settlement.damageDeduction());
    }

    @Test
    @DisplayName("Daño menor que la garantía debe reembolsar la diferencia (reembolso parcial)")
    void shouldRefundPartialDepositWhenDamageLessThanDeposit() {
        Money deposit = Money.cop(200_000);
        Money damage = Money.cop(50_000);

        DepositSettlement settlement = DepositSettlement.calculate(deposit, damage);

        assertEquals(SettlementStatus.REEMBOLSO_PARCIAL, settlement.status());
        assertEquals(Money.cop(150_000), settlement.refundAmount());
        assertEquals(Money.zero(), settlement.extraChargeDue());
    }

    @Test
    @DisplayName("Daño exactamente igual a la garantía debe retener el total sin cobro adicional")
    void shouldRetainTotalDepositWhenDamageEqualsDeposit() {
        Money deposit = Money.cop(200_000);
        Money damage = Money.cop(200_000);

        DepositSettlement settlement = DepositSettlement.calculate(deposit, damage);

        assertEquals(SettlementStatus.RETENIDO_TOTAL, settlement.status());
        assertEquals(Money.zero(), settlement.refundAmount());
        assertEquals(Money.zero(), settlement.extraChargeDue());
    }

    @Test
    @DisplayName("Daño superior a la garantía debe agotar el depósito y marcar saldo pendiente de cobro")
    void shouldChargeExtraWhenDamageExceedsDeposit() {
        Money deposit = Money.cop(200_000);
        Money damage = Money.cop(350_000);

        DepositSettlement settlement = DepositSettlement.calculate(deposit, damage);

        assertEquals(SettlementStatus.SALDO_PENDIENTE_COBRO, settlement.status());
        assertEquals(Money.zero(), settlement.refundAmount());
        assertEquals(Money.cop(150_000), settlement.extraChargeDue());
    }

    @Test
    @DisplayName("Valores negativos deben lanzar BusinessRuleViolationException")
    void shouldThrowWhenNegativeValuesProvided() {
        assertThrows(BusinessRuleViolationException.class, () ->
                DepositSettlement.calculate(Money.cop(-100), Money.cop(50)));
        assertThrows(BusinessRuleViolationException.class, () ->
                DepositSettlement.calculate(Money.cop(100), Money.cop(-50)));
    }
}
