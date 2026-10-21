package com.renta.application.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterProviderRequest(
        @NotBlank(message = "El email no puede estar vacío")
        @Email(message = "El formato de email no es válido")
        String email,

        @NotBlank(message = "La contraseña no puede estar vacía")
        @Size(min = 8, max = 64, message = "La contraseña debe tener entre 8 y 64 caracteres")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#^()_+\\-=]).{8,64}$",
                message = "La contraseña debe incluir al menos una letra mayúscula, una minúscula, un número y un caracter especial (@$!%*?&#^()_+-=)"
        )
        String password,

        @NotBlank(message = "La razón social o nombre de empresa es obligatorio")
        @Size(min = 3, max = 100, message = "La razón social debe tener entre 3 y 100 caracteres")
        @Pattern(
                regexp = "^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñüÜ\\s\\.,&'-]{3,100}$",
                message = "La razón social solo puede contener letras, números, puntos y espacios"
        )
        String companyName,

        @NotBlank(message = "El representante legal es obligatorio")
        @Size(min = 3, max = 80, message = "El nombre del representante legal debe tener entre 3 y 80 caracteres")
        @Pattern(
                regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ\\s'-]{3,80}$",
                message = "El nombre del representante legal solo puede contener letras y espacios"
        )
        String legalRepresentative,

        @NotBlank(message = "El NIT/RUT es obligatorio")
        @Size(min = 8, max = 15, message = "El NIT/RUT debe tener entre 8 y 15 caracteres")
        @Pattern(
                regexp = "^[0-9]{8,10}(-[0-9])?$",
                message = "El NIT/RUT debe tener formato válido de 8 a 10 dígitos (ej: 900123456-1)"
        )
        String nitRut,

        @NotBlank(message = "El teléfono es obligatorio")
        @Pattern(
                regexp = "^(\\+?57)?\\s?(3[0-9]{9}|60[1-8][0-9]{7}|[1-9][0-9]{6,9})$",
                message = "El teléfono debe ser un número válido de 7 a 10 dígitos (ej: 3101234567)"
        )
        String phone,

        @NotBlank(message = "La dirección es obligatoria")
        @Size(min = 5, max = 120, message = "La dirección debe tener entre 5 y 120 caracteres")
        @Pattern(
                regexp = "^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñüÜ#\\-\\.,\\s/°]{5,120}$",
                message = "La dirección contiene caracteres inválidos"
        )
        String address,

        @NotBlank(message = "La ciudad es obligatoria")
        @Size(min = 3, max = 50, message = "La ciudad debe tener entre 3 y 50 caracteres")
        @Pattern(
                regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ\\s\\.-]{3,50}$",
                message = "La ciudad solo puede contener letras, puntos y espacios"
        )
        String city
) {}
