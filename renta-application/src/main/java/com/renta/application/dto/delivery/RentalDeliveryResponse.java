package com.renta.application.dto.delivery;

import java.time.Instant;

public record RentalDeliveryResponse(
        Long id,
        Long reservationId,
        String reservationCode,
        Instant deliveryDate,
        String deliveredBy,
        String initialConditionNotes,
        boolean clientSignatureAck
) {}
