package com.renta.application.dto.delivery;

import jakarta.validation.constraints.NotNull;

public record StartRentalRequest(
        @NotNull(message = "El ID de la reserva es obligatorio")
        Long reservationId,

        String deliveredBy,

        String initialConditionNotes,

        boolean clientSignatureAck,

        Integer initialOperatingHours,
        Integer initialHours,
        String observations
) {
    public StartRentalRequest(Long reservationId, String deliveredBy, String initialConditionNotes, boolean clientSignatureAck) {
        this(reservationId, deliveredBy, initialConditionNotes, clientSignatureAck, null, null, null);
    }
}

