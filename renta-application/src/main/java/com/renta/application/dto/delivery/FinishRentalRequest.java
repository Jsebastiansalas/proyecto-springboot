package com.renta.application.dto.delivery;

import com.renta.domain.model.enums.DamageType;
import com.renta.domain.model.enums.ToolConditionStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record FinishRentalRequest(
        @NotNull(message = "El ID de la reserva es obligatorio")
        Long reservationId,

        @NotBlank(message = "El nombre de quien recibe es obligatorio")
        String receivedBy,

        @NotNull(message = "El estado de condición del equipo es obligatorio")
        ToolConditionStatus conditionStatus,

        @NotBlank(message = "Las notas de inspección son obligatorias")
        String inspectionNotes,

        Boolean depositRefunded,

        @DecimalMin(value = "0.00", message = "El cargo adicional por daños no puede ser negativo")
        BigDecimal extraDamageFee,

        @DecimalMin(value = "0.00", message = "El costo estimado de reparación no puede ser negativo")
        BigDecimal repairCostEstimate,

        DamageType damageType,

        String damageDescription
) {
    public FinishRentalRequest(
            Long reservationId,
            String receivedBy,
            ToolConditionStatus conditionStatus,
            String inspectionNotes,
            boolean depositRefunded,
            BigDecimal extraDamageFee) {
        this(reservationId, receivedBy, conditionStatus, inspectionNotes, depositRefunded, extraDamageFee, null, null, null);
    }

    public FinishRentalRequest(
            Long reservationId,
            String receivedBy,
            ToolConditionStatus conditionStatus,
            String inspectionNotes,
            Boolean depositRefunded,
            BigDecimal extraDamageFee,
            BigDecimal repairCostEstimate) {
        this(reservationId, receivedBy, conditionStatus, inspectionNotes, depositRefunded, extraDamageFee, repairCostEstimate, null, null);
    }
}
