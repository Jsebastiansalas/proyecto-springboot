package com.renta.application.dto.tool;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReplyToolCommentRequest(
        @NotBlank(message = "La respuesta del proveedor no puede estar vacía")
        @Size(max = 2000, message = "La respuesta no puede superar los 2000 caracteres")
        String providerReply
) {}
