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
        Instant updatedAt
) {}
