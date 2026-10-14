package com.renta.domain.model.vo;

import com.renta.domain.exception.BusinessRuleViolationException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Pruebas Unitarias - Value Object Email")
class EmailTest {

    @Test
    @DisplayName("Email válido se normaliza con trim y minúsculas")
    void shouldValidateAndNormalizeValidEmail() {
        Email email = Email.of("  Juan.Perez@EmpresaConstruccion.COM.CO  ");

        assertEquals("juan.perez@empresaconstruccion.com.co", email.value());
        assertEquals("juan.perez@empresaconstruccion.com.co", email.toString());
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "",
            "   ",
            "invalido",
            "juan@",
            "@dominio.com",
            "juan@dominio",
            "juan@.com",
            "juan perez@dominio.com"
    })
    @DisplayName("Emails malformados deben lanzar BusinessRuleViolationException")
    void shouldThrowBusinessRuleViolationExceptionOnInvalidEmailFormat(String invalidEmail) {
        assertThrows(
                BusinessRuleViolationException.class,
                () -> new Email(invalidEmail)
        );
    }
}
