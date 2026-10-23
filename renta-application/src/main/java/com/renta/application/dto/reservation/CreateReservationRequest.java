package com.renta.application.dto.reservation;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreateReservationRequest(
        Long clientId,

        @NotNull(message = "El ID de la herramienta es obligatorio")
        Long toolId,

        @NotNull(message = "La fecha de inicio es obligatoria")
        @FutureOrPresent(message = "La fecha de inicio no puede ser en el pasado")
        LocalDate startDate,

        @NotNull(message = "La fecha de fin es obligatoria")
        LocalDate endDate,

        String notes,

        Boolean includeDamageWaiver
) {
    public CreateReservationRequest(Long clientId, Long toolId, LocalDate startDate, LocalDate endDate, String notes) {
        this(clientId, toolId, startDate, endDate, notes, false);
    }
}
