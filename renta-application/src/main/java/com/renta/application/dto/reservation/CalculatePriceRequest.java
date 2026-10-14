package com.renta.application.dto.reservation;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CalculatePriceRequest(
        @NotNull(message = "El ID de la herramienta es obligatorio")
        Long toolId,

        @NotNull(message = "La fecha de inicio es obligatoria")
        LocalDate startDate,

        @NotNull(message = "La fecha de fin es obligatoria")
        LocalDate endDate
) {}
