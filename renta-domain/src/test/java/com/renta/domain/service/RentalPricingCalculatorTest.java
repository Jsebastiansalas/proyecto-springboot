package com.renta.domain.service;

import com.renta.domain.model.vo.Money;
import com.renta.domain.model.vo.RentalPriceCalculation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Pruebas Unitarias - RentalPricingCalculator")
class RentalPricingCalculatorTest {

    private RentalPricingCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new RentalPricingCalculator();
    }

    @Test
    @DisplayName("R37: 5 días de una herramienta a 45.000/día calcula subtotal 225.000 e IVA 42.750")
    void shouldCalculateStandardDailyRateForFiveDaysRental() {
        Money basePrice = Money.cop(45_000);
        Money deposit = Money.cop(150_000);
        int days = 5;

        RentalPriceCalculation result = calculator.calculate(basePrice, deposit, days);

        assertNotNull(result);
        assertEquals(5, result.totalDays());
        assertFalse(result.weeklyDiscountApplied(), "No debe aplicar tarifa semanal para menos de 7 días");
        assertEquals(new BigDecimal("45000.00"), result.effectiveDailyPrice().amount());
        assertEquals(new BigDecimal("225000.00"), result.subtotal().amount(), "El subtotal debe ser 225.000 COP");
        assertEquals(new BigDecimal("42750.00"), result.taxAmount().amount(), "El IVA (19%) debe ser 42.750 COP");
        assertEquals(new BigDecimal("267750.00"), result.totalWithTax().amount(), "Total con IVA debe ser 267.750 COP");
        assertEquals(new BigDecimal("150000.00"), result.depositAmount().amount());
        assertEquals(new BigDecimal("375000.00"), result.totalReservationAmount().amount());
    }

    @Test
    @DisplayName("R38: 7+ días de renta aplica la tarifa semanal (85% del precio base)")
    void shouldApplyWeeklyRateDiscountForSevenOrMoreDays() {
        Money basePrice = Money.cop(45_000);
        int days = 7;

        RentalPriceCalculation result = calculator.calculate(basePrice, days);

        assertNotNull(result);
        assertEquals(7, result.totalDays());
        assertTrue(result.weeklyDiscountApplied(), "Debe aplicar tarifa semanal para 7 o más días");
        // 45.000 * 0.85 = 38.250
        assertEquals(new BigDecimal("38250.00"), result.effectiveDailyPrice().amount());
        // 7 * 38.250 = 267.750
        assertEquals(new BigDecimal("267750.00"), result.subtotal().amount());
        // 267.750 * 0.19 = 50.872,50
        assertEquals(new BigDecimal("50872.50"), result.taxAmount().amount());
        // 267.750 + 50.872,50 = 318.622,50
        assertEquals(new BigDecimal("318622.50"), result.totalWithTax().amount());
    }

    @Test
    @DisplayName("R38: 10 días de renta a 120.000/día aplica tarifa semanal de 102.000/día")
    void shouldApplyWeeklyRateDiscountForTenDaysRental() {
        Money basePrice = Money.cop(120_000);
        int days = 10;

        RentalPriceCalculation result = calculator.calculate(basePrice, days);

        assertTrue(result.weeklyDiscountApplied());
        // 120.000 * 0.85 = 102.000
        assertEquals(new BigDecimal("102000.00"), result.effectiveDailyPrice().amount());
        // 10 * 102.000 = 1.020.000
        assertEquals(new BigDecimal("1020000.00"), result.subtotal().amount());
        // 1.020.000 * 0.19 = 193.800
        assertEquals(new BigDecimal("193800.00"), result.taxAmount().amount());
        assertEquals(new BigDecimal("1213800.00"), result.totalWithTax().amount());
    }

    @Test
    @DisplayName("Días menores o iguales a cero lanzan IllegalArgumentException")
    void shouldThrowExceptionWhenDaysIsInvalid() {
        Money basePrice = Money.cop(45_000);

        assertThrows(IllegalArgumentException.class, () -> calculator.calculate(basePrice, 0));
        assertThrows(IllegalArgumentException.class, () -> calculator.calculate(basePrice, -3));
    }
}
