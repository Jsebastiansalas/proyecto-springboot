package com.renta.application.mapper;

import com.renta.application.dto.payment.PaymentResponse;
import com.renta.domain.model.entity.Payment;

public final class PaymentDtoMapper {

    private PaymentDtoMapper() {}

    public static PaymentResponse toResponse(Payment p, String reservationCode) {
        if (p == null) return null;
        return new PaymentResponse(
                p.getId(),
                p.getTransactionReference(),
                p.getReservationId(),
                reservationCode,
                p.getClientId(),
                p.getPaymentMethod(),
                p.getAmount() != null ? p.getAmount().amount() : null,
                p.getPaymentStatus(),
                p.getPaymentDate(),
                p.getGatewayReference(),
                p.getInstallmentCount() != null ? p.getInstallmentCount() : 1,
                p.getPaidInstallments() != null ? p.getPaidInstallments() : 1,
                p.getMonthlyInterestRate() != null ? p.getMonthlyInterestRate() : java.math.BigDecimal.ZERO
        );
    }
}
