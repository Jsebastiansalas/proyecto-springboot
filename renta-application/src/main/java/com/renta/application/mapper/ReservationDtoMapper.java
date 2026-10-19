package com.renta.application.mapper;

import com.renta.application.dto.reservation.ReservationResponse;
import com.renta.domain.model.entity.Reservation;

public final class ReservationDtoMapper {

    private ReservationDtoMapper() {}

    public static ReservationResponse toResponse(Reservation res, String clientName, String toolName, String toolImageUrl) {
        return toResponse(res, clientName, toolName, toolImageUrl, null);
    }

    public static ReservationResponse toResponse(Reservation res, String clientName, String toolName, String toolImageUrl, com.renta.domain.model.entity.Payment payment) {
        if (res == null) return null;
        boolean hasPayment = payment != null;
        String paymentStatus = payment != null && payment.getPaymentStatus() != null ? payment.getPaymentStatus().name() : null;
        int installmentCount = payment != null && payment.getInstallmentCount() != null ? payment.getInstallmentCount() : 1;
        int paidInstallments = payment != null && payment.getPaidInstallments() != null ? payment.getPaidInstallments() : 0;

        java.math.BigDecimal totalAmount = res.getTotalAmount() != null ? res.getTotalAmount().amount() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal paidAmount = java.math.BigDecimal.ZERO;
        java.math.BigDecimal pendingAmount = totalAmount;

        if (payment != null) {
            if ("COMPLETADO".equals(paymentStatus)) {
                paidAmount = totalAmount;
                pendingAmount = java.math.BigDecimal.ZERO;
            } else if ("EN_CUOTAS".equals(paymentStatus)) {
                if (installmentCount > 0 && paidInstallments > 0) {
                    java.math.BigDecimal installmentVal = totalAmount.divide(java.math.BigDecimal.valueOf(installmentCount), 2, java.math.RoundingMode.HALF_UP);
                    paidAmount = installmentVal.multiply(java.math.BigDecimal.valueOf(paidInstallments));
                    pendingAmount = totalAmount.subtract(paidAmount);
                    if (pendingAmount.compareTo(java.math.BigDecimal.ZERO) < 0) pendingAmount = java.math.BigDecimal.ZERO;
                }
            }
        }

        return new ReservationResponse(
                res.getId(),
                res.getReservationCode(),
                res.getClientId(),
                clientName,
                res.getToolId(),
                toolName,
                toolImageUrl,
                res.getDateRange() != null ? res.getDateRange().startDate() : null,
                res.getDateRange() != null ? res.getDateRange().endDate() : null,
                res.getTotalDays(),
                res.getSubtotal() != null ? res.getSubtotal().amount() : null,
                res.getDepositTotal() != null ? res.getDepositTotal().amount() : null,
                totalAmount,
                res.getStatus(),
                res.getNotes(),
                res.getCreatedAt(),
                res.getUpdatedAt(),
                hasPayment,
                paymentStatus,
                installmentCount,
                paidInstallments,
                paidAmount,
                pendingAmount
        );
    }
}
