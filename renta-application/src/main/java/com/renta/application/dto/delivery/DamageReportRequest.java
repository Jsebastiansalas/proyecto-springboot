package com.renta.application.dto.delivery;

import com.renta.domain.model.enums.DamageReportStatus;
import com.renta.domain.model.enums.DamageType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public record DamageReportRequest(
        Long returnId,
        Long rentalReturnId,
        String reportedBy,
        DamageType damageType,
        @NotBlank(message = "La descripción de la avería es obligatoria")
        String description,
        @DecimalMin(value = "0.00", message = "El costo estimado no puede ser negativo")
        BigDecimal repairCostEstimate,
        BigDecimal estimatedRepairCost,
        DamageReportStatus status
) {
    public Long effectiveReturnId() {
        return returnId != null ? returnId : (rentalReturnId != null ? rentalReturnId : 0L);
    }

    public BigDecimal effectiveCost() {
        return repairCostEstimate != null ? repairCostEstimate : (estimatedRepairCost != null ? estimatedRepairCost : BigDecimal.ZERO);
    }
}

