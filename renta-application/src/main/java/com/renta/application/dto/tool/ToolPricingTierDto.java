package com.renta.application.dto.tool;

import com.renta.domain.model.enums.PricingTierType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ToolPricingTierDto(
        Long id,
        @NotNull(message = "El tipo de tarifa es obligatorio")
        PricingTierType tierType,
        @Min(value = 1, message = "Los días mínimos deben ser al menos 1")
        int minDays,
        @NotNull(message = "El precio por día no puede ser nulo")
        @Min(value = 1, message = "El precio por día debe ser positivo")
        BigDecimal pricePerDay
) {}
