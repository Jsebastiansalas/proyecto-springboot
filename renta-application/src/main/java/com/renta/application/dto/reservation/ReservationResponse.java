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
}
