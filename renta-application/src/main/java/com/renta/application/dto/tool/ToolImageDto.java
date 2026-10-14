package com.renta.application.dto.tool;

import jakarta.validation.constraints.NotBlank;

public record ToolImageDto(
        Long id,
        @NotBlank(message = "La URL de la imagen no puede estar vacía")
        String imageUrl,
        boolean primary,
        String caption
) {}
