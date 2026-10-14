package com.renta.domain.model.entity;

import com.renta.domain.exception.BusinessRuleViolationException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Review Domain Entity Invariants & Guardrails")
class ReviewTest {

    @Test
    @DisplayName("Creación válida de reseña con calificación y comentario")
    void shouldCreateValidReview() {
        Review review = Review.create(1L, 10L, 100L, 5, "Excelente equipo, cumplió todas las expectativas.");

        assertNotNull(review);
        assertEquals(1L, review.getToolId());
        assertEquals(10L, review.getClientId());
        assertEquals(100L, review.getReservationId());
        assertEquals(5, review.getRating());
        assertEquals("Excelente equipo, cumplió todas las expectativas.", review.getComment());
        assertNotNull(review.getCreatedAt());
    }

    @ParameterizedTest
    @ValueSource(ints = {0, -1, 6, 10})
    @DisplayName("Calificaciones fuera del rango 1 a 5 deben fallar")
    void shouldRejectInvalidRatings(int invalidRating) {
        assertThrows(BusinessRuleViolationException.class, () ->
                Review.create(1L, 10L, 100L, invalidRating, "Comentario válido"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "   ", "ab"})
    @DisplayName("Comentarios vacíos o con menos de 3 caracteres deben fallar")
    void shouldRejectTooShortComments(String shortComment) {
        assertThrows(BusinessRuleViolationException.class, () ->
                Review.create(1L, 10L, 100L, 4, shortComment));
    }
}
