package com.renta.application.dto.coupon;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ApplyCouponRequest(
        @NotBlank(message = "El código del cupón es obligatorio")
        String couponCode,

        LocalDate startDate,

        @NotNull(message = "La cantidad de días es obligatoria")
        @Positive(message = "Los días deben ser mayores a cero")
        Integer rentalDays,

        @NotNull(message = "El subtotal a evaluar es obligatorio")
        @Positive(message = "El subtotal debe ser mayor a cero")
        BigDecimal subtotalAmount
) {
}
