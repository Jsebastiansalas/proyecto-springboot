package com.renta.application.dto.reservation;

import java.time.Instant;

public record ReservationAuditLogResponse(
        Long id,
        Long reservationId,
        String previousStatus,
        String newStatus,
        String changedBy,
        Instant changedAt,
        String reason
) {}
