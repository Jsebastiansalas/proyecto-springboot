package com.renta.application.dto.review;

import java.time.Instant;

public record ReviewResponse(
        Long id,
        Long toolId,
        Long clientId,
        String clientName,
        Long reservationId,
        Integer rating,
        String comment,
        Instant createdAt
) {}
