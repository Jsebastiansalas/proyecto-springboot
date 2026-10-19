package com.renta.application.dto.auth;

import com.renta.domain.model.enums.DocumentType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterClientRequest(
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

        @NotBlank(message = "El nombre es obligatorio")
        @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres")
        @Pattern(
                regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ\\s'-]{2,50}$",
                message = "El nombre solo puede contener letras y espacios"
        )
        String firstName,

        @NotBlank(message = "El apellido es obligatorio")
        @Size(min = 2, max = 50, message = "El apellido debe tener entre 2 y 50 caracteres")
        @Pattern(
                regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ\\s'-]{2,50}$",
                message = "El apellido solo puede contener letras y espacios"
        )
        String lastName,

        @NotNull(message = "El tipo de documento es obligatorio")
        DocumentType documentType,

        @NotBlank(message = "El número de documento es obligatorio")
        @Size(min = 6, max = 15, message = "El número de documento debe tener entre 6 y 15 caracteres")
        @Pattern(
                regexp = "^[0-9A-Za-z-]{6,15}$",
                message = "El número de documento solo puede contener números o letras válidas"
        )
        String documentNumber,

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
                regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ\\s]{3,50}$",
                message = "La ciudad solo puede contener letras y espacios"
        )
        String city
) {}
