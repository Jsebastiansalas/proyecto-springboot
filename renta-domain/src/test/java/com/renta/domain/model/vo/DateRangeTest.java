package com.renta.domain.model.vo;

import com.renta.domain.exception.InvalidDateRangeException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Pruebas Unitarias - Value Object DateRange")
class DateRangeTest {

    @Test
    @DisplayName("R35: Fecha de fin anterior a la inicial debe lanzar InvalidDateRangeException")
    void shouldThrowInvalidDateRangeExceptionWhenEndDateIsBeforeStartDate() {
        LocalDate start = LocalDate.of(2026, 5, 10);
        LocalDate end = LocalDate.of(2026, 5, 9);

        InvalidDateRangeException exception = assertThrows(
                InvalidDateRangeException.class,
                () -> new DateRange(start, end)
        );

        assertTrue(exception.getMessage().contains("no puede ser anterior a la inicial"));
    }

    @Test
    @DisplayName("R36: Dos rangos que se intersectan deben detectarse como solapados")
    void shouldDetectOverlapWhenDateRangesIntersect() {
        DateRange range1 = new DateRange(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 5));
        DateRange range2 = new DateRange(LocalDate.of(2026, 1, 4), LocalDate.of(2026, 1, 8));

        assertTrue(range1.overlapsWith(range2), "El rango [1-5] debe solaparse con [4-8]");
        assertTrue(range2.overlapsWith(range1), "La relación de solapamiento debe ser conmutativa");
    }

    @Test
    @DisplayName("R36: Rangos contiguos sin días en común NO deben solaparse")
    void shouldNotDetectOverlapForContiguousRanges() {
        DateRange rangeA = new DateRange(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 5));
        DateRange rangeB = new DateRange(LocalDate.of(2026, 1, 6), LocalDate.of(2026, 1, 10));

        assertFalse(rangeA.overlapsWith(rangeB), "El rango [1-5] y [6-10] no deben solaparse");
        assertFalse(rangeB.overlapsWith(rangeA), "El rango [6-10] y [1-5] no deben solaparse");
    }

    @Test
    @DisplayName("R37: Rango de 2026-01-05 al 2026-01-09 calcula exactamente 5 días inclusivos")
    void shouldCalculateInclusiveDurationInDays() {
        DateRange range = new DateRange(LocalDate.of(2026, 1, 5), LocalDate.of(2026, 1, 9));

        assertEquals(5, range.durationInDays(), "La duración inclusiva debe ser exactamente 5 días");
        assertEquals(5, range.totalDays(), "totalDays() debe coincidir con durationInDays()");
    }

    @Test
    @DisplayName("Rango de un solo día (mismo inicio y fin) produce 1 día")
    void shouldHandleSingleDayRange() {
        LocalDate sameDay = LocalDate.of(2026, 3, 15);
        DateRange singleDayRange = new DateRange(sameDay, sameDay);

        assertEquals(1, singleDayRange.durationInDays());
        assertTrue(singleDayRange.contains(sameDay));
    }

    @Test
    @DisplayName("Rangos que coinciden en el mismo día extremo se solapan")
    void shouldDetectOverlapWhenTouchingOnSameDay() {
        DateRange range1 = new DateRange(LocalDate.of(2026, 2, 1), LocalDate.of(2026, 2, 5));
        DateRange range2 = new DateRange(LocalDate.of(2026, 2, 5), LocalDate.of(2026, 2, 10));

        assertTrue(range1.overlapsWith(range2), "Deben solaparse porque el día 5 está incluido en ambos");
    }

    @Test
    @DisplayName("Verificación de contención de fechas")
    void shouldVerifyContainsDate() {
        DateRange range = new DateRange(LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 10));

        assertTrue(range.contains(LocalDate.of(2026, 6, 1)));
        assertTrue(range.contains(LocalDate.of(2026, 6, 5)));
        assertTrue(range.contains(LocalDate.of(2026, 6, 10)));
        assertFalse(range.contains(LocalDate.of(2026, 5, 31)));
        assertFalse(range.contains(LocalDate.of(2026, 6, 11)));
        assertFalse(range.contains(null));
    }
}
