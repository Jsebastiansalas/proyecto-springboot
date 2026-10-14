package com.renta.application.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterProviderRequest(
        @NotBlank(message = "El email no puede estar vacío")
        @Email(message = "El formato de email no es válido")
        String email,

        @NotBlank(message = "La contraseña no puede estar vacía")
        @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
        String password,

        @NotBlank(message = "La razón social o nombre de empresa es obligatorio")
        String companyName,

        @NotBlank(message = "El representante legal es obligatorio")
        String legalRepresentative,

        @NotBlank(message = "El NIT/RUT es obligatorio")
        String nitRut,

        @NotBlank(message = "El teléfono es obligatorio")
        String phone,

        @NotBlank(message = "La dirección es obligatoria")
        String address,

        @NotBlank(message = "La ciudad es obligatoria")
        String city
) {}
