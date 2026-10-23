package com.renta.application.service;

import com.renta.application.dto.coupon.ApplyCouponRequest;
import com.renta.application.dto.coupon.CouponValidationResponse;
import com.renta.domain.exception.ResourceNotFoundException;
import com.renta.domain.model.entity.Coupon;
import com.renta.domain.model.vo.Money;
import com.renta.domain.port.in.ValidateCouponUseCase;
import com.renta.domain.port.out.CouponRepositoryPort;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

/**
 * ============================================================================
 * SERVICIO DE APLICACIÓN: CUPONES DE DESCUENTO PROMOCIONAL
 * ============================================================================
 * Orquesta la validación de negocio y el cálculo de descuentos.
 * Java puro (sin anotaciones Spring, se instancia en ApplicationBeanConfiguration).
 */
public class CouponApplicationService implements ValidateCouponUseCase {

    private final CouponRepositoryPort couponRepository;

    public CouponApplicationService(CouponRepositoryPort couponRepository) {
        this.couponRepository = Objects.requireNonNull(couponRepository, "couponRepository es obligatorio");
    }

    @Override
    public Coupon validateCoupon(String code, LocalDate startDate, int rentalDays, Money subtotal) {
        if (code == null || code.trim().isEmpty()) {
            throw new IllegalArgumentException("El código del cupón no puede estar vacío");
        }

        Coupon coupon = couponRepository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Cupón promocional no encontrado: " + code));

        LocalDate dateToEvaluate = startDate != null ? startDate : LocalDate.now();
        coupon.validateApplicability(dateToEvaluate, rentalDays, subtotal);

        return coupon;
    }

    /**
     * Valida el cupón y devuelve el desglose financiero recalculado completo.
     */
    public CouponValidationResponse applyCouponToQuote(ApplyCouponRequest request) {
        Money originalSubtotal = Money.of(request.subtotalAmount());
        LocalDate start = request.startDate() != null ? request.startDate() : LocalDate.now();

        try {
            Coupon coupon = validateCoupon(request.couponCode(), start, request.rentalDays(), originalSubtotal);
            Money discount = coupon.calculateDiscount(originalSubtotal);
            Money discountedSubtotal = originalSubtotal.minus(discount);

            // Calcular 19% de IVA sobre el subtotal descontado
            BigDecimal iva = discountedSubtotal.amount().multiply(BigDecimal.valueOf(0.19));
            BigDecimal finalTotal = discountedSubtotal.amount().add(iva);

            return new CouponValidationResponse(
                    coupon.getCode(),
                    true,
                    coupon.getDiscountPercentage(),
                    discount.amount(),
                    originalSubtotal.amount(),
                    discountedSubtotal.amount(),
                    iva,
                    finalTotal,
                    String.format("Cupón '%s' aplicado exitosamente (%s%% de descuento).",
                            coupon.getCode(), coupon.getDiscountPercentage())
            );
        } catch (Exception e) {
            BigDecimal ivaOriginal = originalSubtotal.amount().multiply(BigDecimal.valueOf(0.19));
            return new CouponValidationResponse(
                    request.couponCode(),
                    false,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    originalSubtotal.amount(),
                    originalSubtotal.amount(),
                    ivaOriginal,
                    originalSubtotal.amount().add(ivaOriginal),
                    e.getMessage()
            );
        }
    }
}
