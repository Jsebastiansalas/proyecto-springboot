package com.renta.domain.port.in;

import com.renta.domain.model.entity.Coupon;
import com.renta.domain.model.vo.Money;

import java.time.LocalDate;

/**
 * Puerto primario / entrada (Hexagonal) para validación y aplicación de cupones.
 */
public interface ValidateCouponUseCase {

    /**
     * Valida la aplicabilidad de un cupón dado un subtotal y cantidad de días de alquiler.
     */
    Coupon validateCoupon(String code, LocalDate startDate, int rentalDays, Money subtotal);
}
