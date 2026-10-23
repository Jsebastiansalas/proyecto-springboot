package com.renta.application.dto.reservation;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * DTO Inmutable (Java Record) para la solicitud de prórroga de alquiler.
 */
public record ExtendReservationRequest(
        @NotNull(message = "La nueva fecha de finalización es obligatoria")
        @Future(message = "La nueva fecha de finalización debe ser en el futuro")
        LocalDate newEndDate,

        @Size(max = 255, message = "El motivo no puede exceder los 255 caracteres")
        String reason
) {
}
