package com.renta.application.dto.tool;

import jakarta.validation.constraints.Size;

public record ReplyToolCommentRequest(
        @Size(max = 2000, message = "La respuesta no puede superar los 2000 caracteres")
        String providerReply,

        String replyContent
) {
    public String effectiveReply() {
        if (providerReply != null && !providerReply.isBlank()) {
            return providerReply;
        }
        if (replyContent != null && !replyContent.isBlank()) {
            return replyContent;
        }
        return "Respuesta confirmada por el proveedor.";
    }
}

