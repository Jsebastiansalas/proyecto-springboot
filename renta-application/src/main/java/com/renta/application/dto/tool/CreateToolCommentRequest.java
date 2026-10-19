package com.renta.application.dto.tool;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateToolCommentRequest(
        @NotBlank(message = "El comentario o pregunta no puede estar vacío")
        @Size(max = 2000, message = "El comentario no puede superar los 2000 caracteres")
        String commentText
) {}
