package com.renta.application.dto.tool;

import jakarta.validation.constraints.NotBlank;

public record ToolSpecificationDto(
        Long id,
        @NotBlank(message = "El nombre de la especificación no puede estar vacío")
        String specName,
        @NotBlank(message = "El valor de la especificación no puede estar vacío")
        String specValue
) {}
