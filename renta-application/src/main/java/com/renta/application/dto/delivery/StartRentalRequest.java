package com.renta.application.dto.delivery;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record StartRentalRequest(
        @NotNull(message = "El ID de la reserva es obligatorio")
        Long reservationId,

        @NotBlank(message = "El nombre de quien entrega es obligatorio")
        String deliveredBy,

        @NotBlank(message = "Las notas del estado inicial son obligatorias")
        String initialConditionNotes,

        boolean clientSignatureAck
) {}
