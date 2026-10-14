package com.renta.application.dto.payment;

import com.renta.domain.model.enums.PaymentMethod;
import com.renta.domain.model.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record PaymentResponse(
        Long id,
        String transactionReference,
        Long reservationId,
        String reservationCode,
        Long clientId,
        PaymentMethod paymentMethod,
        BigDecimal amount,
        PaymentStatus paymentStatus,
        Instant paymentDate,
        String gatewayReference
) {}
