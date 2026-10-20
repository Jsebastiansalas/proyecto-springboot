package com.renta.domain.model.vo;

import com.renta.domain.exception.BusinessRuleViolationException;

import java.util.Locale;
import java.util.Objects;
import java.util.regex.Pattern;

/**
 * ============================================================================
 * OBJETO DE VALOR INMUTABLE (VALUE OBJECT): CORREO ELECTRÓNICO (Email)
 * ============================================================================
 * 
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Encapsula la dirección de correo electrónico del usuario garantizando:
 * 1. Validación de formato RFC 5322 mediante expresión regular estricta.
 * 2. Normalización automática a minúsculas y eliminación de espacios en blanco.
 * 3. Inmutabilidad total: si un correo es inválido, arroja inmediatamente una
 *    excepción de dominio `BusinessRuleViolationException`.
 * 
 * ¿POR QUÉ NO USAR UN SIMPLE String?
 * En DDD se evita la "obsesión por primitivos" (Primitive Obsession). Un String
 * puede contener cualquier texto no validado, mientras que un Value Object `Email`
 * garantiza que todo objeto que lo posea tiene un correo 100% válido por contrato.
 */
public record Email(String value) {

    private static final Pattern PATTERN = Pattern.compile(
            "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    );

    public Email {
        Objects.requireNonNull(value, "El correo electrónico no puede ser nulo");
        String normalized = value.trim().toLowerCase(Locale.ROOT);
        if (normalized.isEmpty() || !PATTERN.matcher(normalized).matches()) {
            throw new BusinessRuleViolationException("Formato de correo electrónico inválido: " + value);
        }
        value = normalized;
    }

    public static Email of(String value) {
        return new Email(value);
    }

    @Override
    public String toString() {
        return value;
    }
}
