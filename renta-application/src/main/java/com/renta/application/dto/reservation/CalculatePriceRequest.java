package com.renta.application.dto.reservation;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CalculatePriceRequest(
        @NotNull(message = "El ID de la herramienta es obligatorio")
        Long toolId,

        LocalDate startDate,

        LocalDate endDate,

        Integer days
) {
    public CalculatePriceRequest(Long toolId, LocalDate startDate, LocalDate endDate) {
        this(toolId, startDate, endDate, null);
    }
}

