package com.renta.domain.service;

import com.renta.domain.model.entity.Tool;
import com.renta.domain.model.vo.DateRange;
import com.renta.domain.model.vo.Money;
import com.renta.domain.model.vo.RentalPriceCalculation;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * ============================================================================
 * SERVICIO DE DOMINIO PURO: CALCULADORA FINANCIERA DE TARIFAS E IMPUESTOS
 * ============================================================================
 * 
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Es el motor matemático central de las reglas de cobro de la plataforma:
 * 1. Calcula el número de días efectivos de alquiler.
 * 2. Evalúa si aplica el DESCUENTO SEMANAL POR VOLUMEN (15% de ahorro para alquileres
 *    de 7 o más días, multiplicando por el factor 0.85).
 * 3. Calcula el subtotal monetario usando el Value Object inmutable {@link Money}.
 * 4. Aplica la tasa legal del IMPUESTO AL VALOR AGREGADO (IVA del 19% en Colombia).
 * 5. Suma el depósito de garantía requerido y genera el desglose financiero completo
 *    {@link RentalPriceCalculation}.
 * 
 * ¿POR QUÉ ESTÁ CREADO Y DÓNDE ENCAJA EN LA ARQUITECTURA?
 * En el Diseño Guiado por el Dominio (DDD), esta clase es un SERVICIO DE DOMINIO PURO
 * (Domain Service). Vive en el módulo `renta-domain`. No tiene anotaciones `@Service` de
 * Spring, ni dependencias de frameworks ni de SQL. Es 100% Java estándar inmutable, lo
 * que permite probarlo con pruebas unitarias ultra rápidas y garantiza que la regla de
 * negocio nunca cambie por decisiones tecnológicas externas.
 */
public class RentalPricingCalculator {

    /**
     * Factor de descuento por volumen para 7 o más días: 85% de la tarifa base (15% de descuento).
     */
    public static final BigDecimal WEEKLY_DISCOUNT_FACTOR = BigDecimal.valueOf(0.85);

    /**
     * Standard Colombian IVA tax rate (19%).
     */
    public static final BigDecimal IVA_RATE = BigDecimal.valueOf(19);

    /**
     * Minimum duration in days to trigger the weekly pricing tier.
     */
    public static final int WEEKLY_THRESHOLD_DAYS = 7;

    /**
     * Tasa de seguro de cobertura contra daños (8% del subtotal de alquiler).
     */
    public static final BigDecimal DAMAGE_INSURANCE_RATE = BigDecimal.valueOf(0.08);

    /**
     * Descuento en depósito de garantía si el cliente contrata seguro (fianza al 50%).
     */
    public static final BigDecimal INSURANCE_DEPOSIT_DISCOUNT_FACTOR = BigDecimal.valueOf(0.50);

    /**
     * Recargo por día de fin de semana (Sábado o Domingo): 20% adicional.
     */
    public static final BigDecimal WEEKEND_SURCHARGE_RATE = BigDecimal.valueOf(0.20);

    /**
     * Calculates the full financial breakdown for a rental given daily price, deposit, and days.
     */
    public RentalPriceCalculation calculate(Money baseDailyPrice, Money depositAmount, int totalDays) {
        Objects.requireNonNull(baseDailyPrice, "El precio base diario no puede ser nulo");
        if (totalDays <= 0) {
            throw new IllegalArgumentException("La cantidad de días debe ser mayor a cero");
        }

        boolean applyWeeklyDiscount = totalDays >= WEEKLY_THRESHOLD_DAYS;
        Money effectiveDailyPrice = applyWeeklyDiscount
                ? baseDailyPrice.multiply(WEEKLY_DISCOUNT_FACTOR)
                : baseDailyPrice;

        Money subtotal = effectiveDailyPrice.multiply(totalDays);
        Money taxAmount = subtotal.percentage(IVA_RATE);
        Money totalWithTax = subtotal.plus(taxAmount);

        Money deposit = depositAmount != null ? depositAmount : Money.zero(baseDailyPrice.currency());
        Money totalReservationAmount = subtotal.plus(deposit);

        return new RentalPriceCalculation(
                baseDailyPrice,
                effectiveDailyPrice,
                totalDays,
                applyWeeklyDiscount,
                subtotal,
                taxAmount,
                totalWithTax,
                deposit,
                totalReservationAmount
        );
    }

    public RentalPriceCalculation calculate(Money baseDailyPrice, Money depositAmount, int totalDays, boolean includeDamageInsurance) {
        RentalPriceCalculation baseCalc = calculate(baseDailyPrice, depositAmount, totalDays);
        if (!includeDamageInsurance) {
            return baseCalc;
        }

        Money insuranceCost = Money.of(baseCalc.subtotal().amount().multiply(DAMAGE_INSURANCE_RATE));
        Money discountedDeposit = baseCalc.depositAmount().multiply(INSURANCE_DEPOSIT_DISCOUNT_FACTOR);
        Money totalReservationAmount = baseCalc.subtotal().plus(discountedDeposit).plus(insuranceCost);

        return new RentalPriceCalculation(
                baseCalc.baseDailyPrice(),
                baseCalc.effectiveDailyPrice(),
                baseCalc.totalDays(),
                baseCalc.weeklyDiscountApplied(),
                baseCalc.subtotal(),
                baseCalc.taxAmount(),
                baseCalc.totalWithTax(),
                discountedDeposit,
                totalReservationAmount,
                true,
                insuranceCost,
                Money.zero()
        );
    }

    public RentalPriceCalculation calculateWithWeekendSurcharge(
            Money baseDailyPrice,
            Money depositAmount,
            DateRange dateRange,
            boolean includeWeekendSurcharge,
            boolean includeDamageInsurance) {

        Objects.requireNonNull(baseDailyPrice, "El precio base diario no puede ser nulo");
        Objects.requireNonNull(dateRange, "El rango de fechas no puede ser nulo");

        int totalDays = dateRange.durationInDays();
        if (!includeWeekendSurcharge) {
            return calculate(baseDailyPrice, depositAmount, totalDays, includeDamageInsurance);
        }

        long weekendDays = dateRange.startDate().datesUntil(dateRange.endDate().plusDays(1))
                .filter(d -> d.getDayOfWeek() == java.time.DayOfWeek.SATURDAY || d.getDayOfWeek() == java.time.DayOfWeek.SUNDAY)
                .count();
        long regularDays = totalDays - weekendDays;

        boolean applyWeeklyDiscount = totalDays >= WEEKLY_THRESHOLD_DAYS;
        Money effectiveDailyPrice = applyWeeklyDiscount
                ? baseDailyPrice.multiply(WEEKLY_DISCOUNT_FACTOR)
                : baseDailyPrice;

        Money regularSubtotal = effectiveDailyPrice.multiply((int) regularDays);
        Money weekendDailyPrice = Money.of(effectiveDailyPrice.amount().multiply(BigDecimal.ONE.add(WEEKEND_SURCHARGE_RATE)));
        Money weekendSubtotal = weekendDailyPrice.multiply((int) weekendDays);
        Money subtotal = regularSubtotal.plus(weekendSubtotal);

        Money standardSubtotal = effectiveDailyPrice.multiply(totalDays);
        Money weekendSurchargeAmount = subtotal.subtract(standardSubtotal);

        Money taxAmount = subtotal.percentage(IVA_RATE);
        Money totalWithTax = subtotal.plus(taxAmount);

        Money deposit = depositAmount != null ? depositAmount : Money.zero(baseDailyPrice.currency());
        Money insuranceCost = Money.zero();
        boolean insuranceApplied = false;

        if (includeDamageInsurance) {
            insuranceCost = Money.of(subtotal.amount().multiply(DAMAGE_INSURANCE_RATE));
            deposit = deposit.multiply(INSURANCE_DEPOSIT_DISCOUNT_FACTOR);
            insuranceApplied = true;
        }

        Money totalReservationAmount = subtotal.plus(deposit).plus(insuranceCost);

        return new RentalPriceCalculation(
                baseDailyPrice,
                effectiveDailyPrice,
                totalDays,
                applyWeeklyDiscount,
                subtotal,
                taxAmount,
                totalWithTax,
                deposit,
                totalReservationAmount,
                insuranceApplied,
                insuranceCost,
                weekendSurchargeAmount
        );
    }

    public RentalPriceCalculation calculate(Money baseDailyPrice, int totalDays) {
        return calculate(baseDailyPrice, Money.zero(), totalDays);
    }

    public RentalPriceCalculation calculate(BigDecimal baseDailyPrice, BigDecimal depositAmount, int totalDays) {
        Objects.requireNonNull(baseDailyPrice, "El precio base diario no puede ser nulo");
        Money base = Money.cop(baseDailyPrice);
        Money deposit = depositAmount != null ? Money.cop(depositAmount) : Money.zero();
        return calculate(base, deposit, totalDays);
    }

    public RentalPriceCalculation calculatePrice(BigDecimal baseDailyPrice, int totalDays) {
        return calculate(baseDailyPrice, BigDecimal.ZERO, totalDays);
    }

    public RentalPriceCalculation calculate(Tool tool, DateRange dateRange) {
        Objects.requireNonNull(tool, "La herramienta no puede ser nula");
        Objects.requireNonNull(dateRange, "El rango de fechas no puede ser nulo");
        return calculate(tool.getBaseDailyPrice(), tool.getDepositAmount(), dateRange.durationInDays());
    }

    public RentalPriceCalculation calculatePrice(Long toolId, DateRange dateRange, Money baseDailyPrice, Money depositAmount) {
        Objects.requireNonNull(dateRange, "El rango de fechas no puede ser nulo");
        return calculate(baseDailyPrice, depositAmount, dateRange.durationInDays());
    }
}
