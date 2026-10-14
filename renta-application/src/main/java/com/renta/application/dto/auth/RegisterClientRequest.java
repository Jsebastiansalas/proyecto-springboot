package com.renta.application.dto.auth;

import com.renta.domain.model.enums.DocumentType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterClientRequest(
        @NotBlank(message = "El email no puede estar vacío")
        @Email(message = "El formato de email no es válido")
        String email,

        @NotBlank(message = "La contraseña no puede estar vacía")
        @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
        String password,

        @NotBlank(message = "El nombre es obligatorio")
        String firstName,

        @NotBlank(message = "El apellido es obligatorio")
        String lastName,

        @NotNull(message = "El tipo de documento es obligatorio")
        DocumentType documentType,

        @NotBlank(message = "El número de documento es obligatorio")
        String documentNumber,

        @NotBlank(message = "El teléfono es obligatorio")
        String phone,

        @NotBlank(message = "La dirección es obligatoria")
        String address,

        @NotBlank(message = "La ciudad es obligatoria")
        String city
) {}
