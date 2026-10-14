package com.renta.domain.service;

import com.renta.domain.model.entity.Tool;
import com.renta.domain.model.vo.DateRange;
import com.renta.domain.model.vo.Money;
import com.renta.domain.model.vo.RentalPriceCalculation;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Pure domain service for calculating rental fees, volume-based weekly discounts (85%),
 * and value-added tax (IVA 19%).
 */
public class RentalPricingCalculator {

    /**
     * Volume discount factor for 7 or more rental days: 85% of base price (15% discount).
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
