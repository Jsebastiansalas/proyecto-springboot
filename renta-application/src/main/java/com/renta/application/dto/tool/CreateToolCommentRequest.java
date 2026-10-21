package com.renta.application.dto.tool;

import jakarta.validation.constraints.Size;

public record CreateToolCommentRequest(
        @Size(max = 2000, message = "El comentario no puede superar los 2000 caracteres")
        String commentText,

        String content
) {
    public String effectiveCommentText() {
        if (commentText != null && !commentText.isBlank()) {
            return commentText;
        }
        if (content != null && !content.isBlank()) {
            return content;
        }
        return "Consulta técnica";
    }
}

