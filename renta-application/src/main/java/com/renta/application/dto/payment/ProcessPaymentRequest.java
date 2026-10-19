package com.renta.application.dto.payment;

import com.renta.domain.model.enums.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ProcessPaymentRequest(
        @NotNull(message = "El ID de la reserva es obligatorio")
        Long reservationId,

        Long clientId,

        @NotNull(message = "El método de pago es obligatorio")
        PaymentMethod paymentMethod,

        @NotNull(message = "El monto es obligatorio")
        @DecimalMin(value = "0.01", message = "El monto debe ser positivo")
        BigDecimal amount,

        String cardNumberMasked,
        String gatewayReference,
        Integer installmentCount
) {
    public ProcessPaymentRequest(Long reservationId, Long clientId, PaymentMethod paymentMethod, BigDecimal amount, String cardNumberMasked, String gatewayReference) {
        this(reservationId, clientId, paymentMethod, amount, cardNumberMasked, gatewayReference, 1);
    }
}
