package com.renta.application.dto.coupon;

import java.math.BigDecimal;

public record CouponValidationResponse(
        String code,
        boolean valid,
        BigDecimal discountPercentage,
        BigDecimal discountAmount,
        BigDecimal originalSubtotal,
        BigDecimal discountedSubtotal,
        BigDecimal ivaAmount,
        BigDecimal finalTotal,
        String message
) {
}
