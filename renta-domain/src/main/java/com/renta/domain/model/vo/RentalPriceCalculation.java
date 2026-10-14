package com.renta.domain.model.vo;

import java.util.Objects;

/**
 * Value Object representing the itemized financial calculation of a rental.
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
        Money totalReservationAmount
) {
    public RentalPriceCalculation {
        Objects.requireNonNull(baseDailyPrice, "El precio base diario no puede ser nulo");
        Objects.requireNonNull(effectiveDailyPrice, "El precio diario efectivo no puede ser nulo");
        Objects.requireNonNull(subtotal, "El subtotal no puede ser nulo");
        Objects.requireNonNull(taxAmount, "El valor de impuestos (IVA) no puede ser nulo");
        Objects.requireNonNull(totalWithTax, "El total con impuestos no puede ser nulo");
        Objects.requireNonNull(depositAmount, "El depósito en garantía no puede ser nulo");
        Objects.requireNonNull(totalReservationAmount, "El monto total de reserva no puede ser nulo");
    }
}
