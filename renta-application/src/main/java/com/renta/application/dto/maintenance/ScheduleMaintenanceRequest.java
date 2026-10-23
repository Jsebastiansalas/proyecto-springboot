package com.renta.application.dto.maintenance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ScheduleMaintenanceRequest(
        @NotNull(message = "El ID de la herramienta es obligatorio")
        Long toolId,

        @NotBlank(message = "El tipo de mantenimiento es obligatorio (PREVENTIVO, CORRECTIVO, CALIBRACION)")
        String maintenanceType,

        @NotNull(message = "La fecha de inicio es obligatoria")
        LocalDate startDate,

        LocalDate estimatedEndDate,

        @PositiveOrZero(message = "El costo estimado no puede ser negativo")
        BigDecimal estimatedCost,

        String technicianName,

        @NotBlank(message = "El motivo o descripción técnica es obligatorio")
        String description
) {
}
