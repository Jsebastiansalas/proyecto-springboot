package com.renta.application.dto.tool;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record CreateToolRequest(
        @NotNull(message = "El ID del proveedor es obligatorio")
        Long providerId,

        @NotNull(message = "La categoría es obligatoria")
        Integer categoryId,

        @NotBlank(message = "El código SKU es obligatorio")
        String codeSku,

        @NotBlank(message = "El nombre de la herramienta es obligatorio")
        String name,

        @NotBlank(message = "La marca es obligatoria")
        String brand,

        @NotBlank(message = "El modelo es obligatorio")
        String model,

        @NotBlank(message = "La descripción es obligatoria")
        String description,

        @NotNull(message = "El precio diario base es obligatorio")
        @DecimalMin(value = "0.01", message = "El precio diario base debe ser mayor a cero")
        BigDecimal baseDailyPrice,

        @NotNull(message = "El depósito de garantía es obligatorio")
        @DecimalMin(value = "0.00", message = "El depósito no puede ser negativo")
        BigDecimal depositAmount,

        String mainImageUrl,

        List<ToolImageDto> images,
        List<ToolSpecificationDto> specifications,
        List<ToolPricingTierDto> pricingTiers,
        List<ToolSafetyRequirementDto> safetyRequirements
) {}
