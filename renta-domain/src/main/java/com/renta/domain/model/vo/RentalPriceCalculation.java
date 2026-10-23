package com.renta.domain.model.vo;

import java.util.Objects;

/**
 * Value Object inmutable que representa el desglose financiero completo de una cotización o alquiler.
 */
public record RentalPriceCalculation(
        Money baseDailyPrice,
        Money effectiveDailyPrice,
        int totalDays,
        boolean weeklyDiscountApplied,
        Money subtotal,
        Money taxAmount,
        Money totalWithTax,
        Money depositAmount,
        Money totalReservationAmount,
        boolean damageInsuranceApplied,
        Money insuranceCost,
        Money weekendSurchargeAmount
) {
    public RentalPriceCalculation {
        Objects.requireNonNull(baseDailyPrice, "El precio base diario no puede ser nulo");
        Objects.requireNonNull(effectiveDailyPrice, "El precio diario efectivo no puede ser nulo");
        Objects.requireNonNull(subtotal, "El subtotal no puede ser nulo");
        Objects.requireNonNull(taxAmount, "El valor de impuestos (IVA) no puede ser nulo");
        Objects.requireNonNull(totalWithTax, "El total con impuestos no puede ser nulo");
        Objects.requireNonNull(depositAmount, "El depósito en garantía no puede ser nulo");
        Objects.requireNonNull(totalReservationAmount, "El monto total de reserva no puede ser nulo");
        insuranceCost = insuranceCost != null ? insuranceCost : Money.zero();
        weekendSurchargeAmount = weekendSurchargeAmount != null ? weekendSurchargeAmount : Money.zero();
    }

    public RentalPriceCalculation(
            Money baseDailyPrice,
            Money effectiveDailyPrice,
            int totalDays,
            boolean weeklyDiscountApplied,
            Money subtotal,
            Money taxAmount,
            Money totalWithTax,
            Money depositAmount,
            Money totalReservationAmount) {
        this(baseDailyPrice, effectiveDailyPrice, totalDays, weeklyDiscountApplied,
                subtotal, taxAmount, totalWithTax, depositAmount, totalReservationAmount,
                false, Money.zero(), Money.zero());
    }
}
