package com.renta.domain.service;

import com.renta.domain.model.vo.Money;
import com.renta.domain.model.vo.RentalPriceCalculation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * ============================================================================
 * PRUEBAS UNITARIAS DE DOMINIO PURO: RentalPricingCalculatorTest
 * ============================================================================
 * Prueba las reglas matemáticas del negocio con JUnit 5 estándar (sin Spring):
 * 1. Tarifa diaria estándar (1 a 6 días).
 * 2. Descuento semanal del 15% (factor 0.85 para 7 o más días).
 * 3. Impuesto legal de IVA colombiano (19%).
 * 4. Suma del depósito de garantía y total a pagar.
 * 5. Manejo de valores límite y excepciones de negocio.
 */
class RentalPricingCalculatorTest {

    private RentalPricingCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new RentalPricingCalculator();
    }

    @Test
    @DisplayName("Debe calcular correctamente el alquiler estándar de 3 días sin descuento")
    void shouldCalculateStandardRentalWithoutDiscount() {
        Money dailyPrice = Money.of(100000);
        Money deposit = Money.of(200000);
        int days = 3;

        RentalPriceCalculation result = calculator.calculate(dailyPrice, deposit, days);

        assertNotNull(result);
        assertEquals(3, result.totalDays());
        assertFalse(result.weeklyDiscountApplied());
        assertEquals(0, new BigDecimal("100000.00").compareTo(result.effectiveDailyPrice().amount()));
        assertEquals(0, new BigDecimal("300000.00").compareTo(result.subtotal().amount()));
        assertEquals(0, new BigDecimal("57000.00").compareTo(result.taxAmount().amount()));
        assertEquals(0, new BigDecimal("357000.00").compareTo(result.totalWithTax().amount()));
        assertEquals(0, new BigDecimal("500000.00").compareTo(result.totalReservationAmount().amount()));
    }

    @ParameterizedTest
    @ValueSource(ints = {7, 10, 14, 30})
    @DisplayName("Debe aplicar 15% de descuento para alquileres de 7 o más días")
    void shouldApplyWeeklyDiscountForSevenDaysOrMore(int days) {
        Money dailyPrice = Money.of(100000);
        Money deposit = Money.of(50000);

        RentalPriceCalculation result = calculator.calculate(dailyPrice, deposit, days);

        assertTrue(result.weeklyDiscountApplied());
        assertEquals(0, new BigDecimal("85000.00").compareTo(result.effectiveDailyPrice().amount()));

        BigDecimal expectedSubtotal = BigDecimal.valueOf(85000).multiply(BigDecimal.valueOf(days));
        assertEquals(0, expectedSubtotal.compareTo(result.subtotal().amount()));
    }

    @Test
    @DisplayName("Debe lanzar IllegalArgumentException si los días son cero o negativos")
    void shouldThrowExceptionWhenDaysAreZeroOrNegative() {
        Money dailyPrice = Money.of(50000);
        Money deposit = Money.of(10000);

        assertThrows(IllegalArgumentException.class, () -> calculator.calculate(dailyPrice, deposit, 0));
        assertThrows(IllegalArgumentException.class, () -> calculator.calculate(dailyPrice, deposit, -5));
    }

    @Test
    @DisplayName("Debe lanzar NullPointerException si la tarifa diaria es nula")
    void shouldThrowExceptionWhenDailyPriceIsNull() {
        assertThrows(NullPointerException.class, () -> calculator.calculate(null, Money.zero(), 5));
    }

    @Test
    @DisplayName("Debe aplicar seguro contra daños (8% subtotal) y reducir la fianza al 50%")
    void shouldApplyDamageInsuranceAndReduceDepositByHalf() {
        Money dailyPrice = Money.of(100000);
        Money deposit = Money.of(400000);
        int days = 5; // Subtotal: 500.000 COP

        RentalPriceCalculation result = calculator.calculate(dailyPrice, deposit, days, true);

        assertTrue(result.damageInsuranceApplied());
        // Seguro: 8% de 500.000 = 40.000 COP
        assertEquals(0, BigDecimal.valueOf(40000).compareTo(result.insuranceCost().amount()));
        // Fianza reducida al 50%: 400.000 * 0.5 = 200.000 COP
        assertEquals(0, BigDecimal.valueOf(200000).compareTo(result.depositAmount().amount()));
        // Total reserva: 500.000 subtotal + 200.000 fianza + 40.000 seguro = 740.000 COP
        assertEquals(0, BigDecimal.valueOf(740000).compareTo(result.totalReservationAmount().amount()));
    }

    @Test
    @DisplayName("Debe aplicar recargo del 20% en días de fin de semana (Sábado y Domingo)")
    void shouldApplyWeekendSurchargeCorrectly() {
        Money dailyPrice = Money.of(100000);
        Money deposit = Money.of(200000);
        // Rango de Viernes (2026-11-06) a Lunes (2026-11-09): 4 días (Viernes, Sábado, Domingo, Lunes)
        // 2 días regulares (100k c/u = 200k) + 2 días fin de semana (120k c/u = 240k) = Subtotal 440.000 COP
        com.renta.domain.model.vo.DateRange dateRange = new com.renta.domain.model.vo.DateRange(
                java.time.LocalDate.of(2026, 11, 6),
                java.time.LocalDate.of(2026, 11, 9)
        );

        RentalPriceCalculation result = calculator.calculateWithWeekendSurcharge(
                dailyPrice, deposit, dateRange, true, false
        );

        assertEquals(4, result.totalDays());
        assertEquals(0, BigDecimal.valueOf(440000).compareTo(result.subtotal().amount()));
        // Recargo extra respecto al precio estándar (400.000 vs 440.000 = 40.000 COP)
        assertEquals(0, BigDecimal.valueOf(40000).compareTo(result.weekendSurchargeAmount().amount()));
    }
}
