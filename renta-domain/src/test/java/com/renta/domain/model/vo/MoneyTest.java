package com.renta.domain.model.vo;

import com.renta.domain.exception.BusinessRuleViolationException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Pruebas Unitarias - Value Object Money")
class MoneyTest {

    @Test
    @DisplayName("Creación de Money en COP y redondeo comercial HALF_UP a 2 decimales")
    void shouldCreateCopMoneyAndRoundToTwoDecimalsHalfUp() {
        Money money = Money.cop(new BigDecimal("45000.555"));

        assertEquals(new BigDecimal("45000.56"), money.amount());
        assertEquals("COP", money.currency());
    }

    @Test
    @DisplayName("Suma y resta de importes en la misma divisa")
    void shouldPerformAdditionAndSubtraction() {
        Money m1 = Money.cop(100_000);
        Money m2 = Money.cop(45_000);

        Money sum = m1.plus(m2);
        Money diff = m1.minus(m2);

        assertEquals(new BigDecimal("145000.00"), sum.amount());
        assertEquals(new BigDecimal("55000.00"), diff.amount());
    }

    @Test
    @DisplayName("Operaciones entre divisas diferentes deben lanzar BusinessRuleViolationException")
    void shouldThrowExceptionWhenOperatingDifferentCurrencies() {
        Money cop = Money.of(new BigDecimal("100000"), "COP");
        Money usd = Money.of(new BigDecimal("50"), "USD");

        assertThrows(BusinessRuleViolationException.class, () -> cop.plus(usd));
        assertThrows(BusinessRuleViolationException.class, () -> cop.minus(usd));
    }

    @Test
    @DisplayName("Multiplicación por factor entero y decimal")
    void shouldPerformMultiplicationByFactor() {
        Money base = Money.cop(45_000);

        Money total5Days = base.multiply(5);
        assertEquals(new BigDecimal("225000.00"), total5Days.amount());

        Money weeklyDiscounted = base.multiply(new BigDecimal("0.85"));
        assertEquals(new BigDecimal("38250.00"), weeklyDiscounted.amount());
    }

    @Test
    @DisplayName("Cálculo de porcentaje de IVA al 19%")
    void shouldCalculatePercentageCorrectly() {
        Money subtotal = Money.cop(225_000);

        Money iva = subtotal.percentage(new BigDecimal("19"));
        assertEquals(new BigDecimal("42750.00"), iva.amount());
    }

    @Test
    @DisplayName("Comparaciones y predicados booleanos")
    void shouldPerformComparisons() {
        Money m1 = Money.cop(50_000);
        Money m2 = Money.cop(30_000);
        Money zero = Money.zero();

        assertTrue(m1.isGreaterThan(m2));
        assertTrue(m2.isLessThan(m1));
        assertTrue(m1.isPositive());
        assertTrue(zero.isZero());
        assertFalse(m1.isZero());
    }
}
