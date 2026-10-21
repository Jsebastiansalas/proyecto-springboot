package com.renta.application.dto.reservation;

import com.renta.domain.model.enums.ReservationStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record ReservationResponse(
        Long id,
        String reservationCode,
        Long clientId,
        String clientName,
        Long toolId,
        String toolName,
        String toolImageUrl,
        LocalDate startDate,
        LocalDate endDate,
        int totalDays,
        BigDecimal subtotal,
        BigDecimal depositTotal,
        BigDecimal totalAmount,
        ReservationStatus status,
        String notes,
        Instant createdAt,
        Instant updatedAt,
        Boolean hasPayment,
        String paymentStatus,
        Integer installmentCount,
        Integer paidInstallments,
        BigDecimal paidAmount,
        BigDecimal pendingAmount
) {
    public ReservationResponse(Long id, String reservationCode, Long clientId, String clientName,
                               Long toolId, String toolName, String toolImageUrl,
                               LocalDate startDate, LocalDate endDate, int totalDays,
                               BigDecimal subtotal, BigDecimal depositTotal, BigDecimal totalAmount,
                               ReservationStatus status, String notes, Instant createdAt, Instant updatedAt) {
        this(id, reservationCode, clientId, clientName, toolId, toolName, toolImageUrl,
                startDate, endDate, totalDays, subtotal, depositTotal, totalAmount,
                status, notes, createdAt, updatedAt, false, null, 1, 0, BigDecimal.ZERO, totalAmount);
    }

    public BigDecimal getTotalPrice() {
        return totalAmount != null ? totalAmount : BigDecimal.ZERO;
    }

    public BigDecimal getDepositAmount() {
        return depositTotal != null ? depositTotal : BigDecimal.ZERO;
    }

    public BigDecimal getSubtotalPrice() {
        return subtotal != null ? subtotal : BigDecimal.ZERO;
    }

    public BigDecimal getTaxAmount() {
        if (subtotal != null) {
            return subtotal.multiply(new BigDecimal("0.19")).setScale(2, java.math.RoundingMode.HALF_UP);
        }
        return BigDecimal.ZERO;
    }

    public String getToolImage() {
        return toolImageUrl;
    }

    public BigDecimal getDailyPrice() {
        if (subtotal != null && totalDays > 0) {
            return subtotal.divide(BigDecimal.valueOf(totalDays), 2, java.math.RoundingMode.HALF_UP);
        }
        return BigDecimal.ZERO;
    }
}
