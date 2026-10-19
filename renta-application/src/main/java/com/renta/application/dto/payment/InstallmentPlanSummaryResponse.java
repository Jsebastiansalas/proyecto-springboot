package com.renta.application.dto.payment;

import java.math.BigDecimal;
import java.util.List;

public record InstallmentPlanSummaryResponse(
        Long paymentId,
        Long reservationId,
        String reservationCode,
        Integer installmentCount,
        Integer paidInstallments,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        BigDecimal pendingAmount,
        String paymentStatus,
        List<PaymentInstallmentResponse> installments
) {}
