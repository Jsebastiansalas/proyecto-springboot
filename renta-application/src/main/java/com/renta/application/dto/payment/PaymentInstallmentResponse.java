package com.renta.application.dto.payment;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record PaymentInstallmentResponse(
        Long id,
        Long paymentId,
        Long reservationId,
        Integer installmentNumber,
        Integer totalInstallments,
        LocalDate dueDate,
        BigDecimal principalAmount,
        BigDecimal interestAmount,
        BigDecimal totalInstallmentAmount,
        String status,
        Instant paidAt,
        String transactionRef
) {}
