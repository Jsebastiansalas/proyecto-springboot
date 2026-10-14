package com.renta.application.dto.tool;

import jakarta.validation.constraints.NotBlank;

public record ToolSafetyRequirementDto(
        Long id,
        @NotBlank(message = "El nombre del requisito es obligatorio")
        String requirementName,
        @NotBlank(message = "La descripción del requisito es obligatoria")
        String description
) {}
