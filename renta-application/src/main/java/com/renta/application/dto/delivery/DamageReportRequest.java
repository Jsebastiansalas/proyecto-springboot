package com.renta.application.dto.delivery;

import com.renta.domain.model.enums.DamageReportStatus;
import com.renta.domain.model.enums.DamageType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record DamageReportRequest(
        @NotNull(message = "El ID de la devolución es obligatorio")
        Long returnId,

        @NotBlank(message = "El nombre del inspector es obligatorio")
        String reportedBy,

        @NotNull(message = "El tipo de daño es obligatorio")
        DamageType damageType,

        @NotBlank(message = "La descripción de la avería es obligatoria")
        String description,

        @NotNull(message = "El costo estimado de reparación es obligatorio")
        @DecimalMin(value = "0.00", message = "El costo estimado no puede ser negativo")
        BigDecimal repairCostEstimate,

        DamageReportStatus status
) {}
