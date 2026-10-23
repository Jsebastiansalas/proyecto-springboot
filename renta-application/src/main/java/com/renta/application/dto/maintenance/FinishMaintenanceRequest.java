package com.renta.application.dto.maintenance;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;

public record FinishMaintenanceRequest(
        @NotNull(message = "La fecha de finalización es obligatoria")
        LocalDate completionDate,

        @PositiveOrZero(message = "El costo final no puede ser negativo")
        BigDecimal finalCost,

        String resolutionNotes
) {
}
