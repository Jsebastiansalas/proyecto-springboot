package com.renta.domain.model.vo;

import com.renta.domain.exception.BusinessRuleViolationException;

import java.util.Locale;
import java.util.Objects;
import java.util.regex.Pattern;

/**
 * Immutable Value Object representing a validated and normalized email address.
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
