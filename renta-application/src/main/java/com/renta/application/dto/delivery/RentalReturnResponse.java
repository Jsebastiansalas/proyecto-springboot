package com.renta.application.dto.delivery;

import com.renta.domain.model.enums.ToolConditionStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record RentalReturnResponse(
        Long id,
        Long reservationId,
        String reservationCode,
        Instant returnDate,
        String receivedBy,
        ToolConditionStatus conditionStatus,
        String inspectionNotes,
        boolean depositRefunded,
        BigDecimal extraDamageFee
) {}
