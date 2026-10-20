package com.renta.domain.model.vo;

import com.renta.domain.exception.InvalidDateRangeException;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Objects;

/**
 * ============================================================================
 * OBJETO DE VALOR INMUTABLE (VALUE OBJECT): INTERVALO DE FECHAS (DateRange)
 * ============================================================================
 * 
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Modela un periodo de tiempo cerrado `[startDate, endDate]` para contratos de alquiler:
 * 1. Valida en su constructor compacto que la fecha final no sea anterior a la fecha inicial.
 * 2. Calcula automáticamente el total de días calendario (`totalDays()`).
 * 3. Provee el método matemático `overlaps(other)` para detectar si dos reservas
 *    chocan en el tiempo: `!this.endDate.isBefore(other.startDate) && !other.endDate.isBefore(this.startDate)`.
 * 
 * ¿POR QUÉ ES UN RECORD?
 * En DDD, los periodos de tiempo no tienen ciclo de vida ni ID de base de datos;
 * son valores inmutables que no pueden corromperse una vez instanciados.
 */
public record DateRange(LocalDate startDate, LocalDate endDate) {

    public DateRange {
        Objects.requireNonNull(startDate, "La fecha de inicio no puede ser nula");
        Objects.requireNonNull(endDate, "La fecha de fin no puede ser nula");
        if (endDate.isBefore(startDate)) {
            throw new InvalidDateRangeException(
                    String.format("La fecha final (%s) no puede ser anterior a la inicial (%s)", endDate, startDate)
            );
        }
    }

    public static DateRange of(LocalDate startDate, LocalDate endDate) {
        return new DateRange(startDate, endDate);
    }

    public static DateRange fromDays(LocalDate startDate, int days) {
        Objects.requireNonNull(startDate, "La fecha de inicio no puede ser nula");
        if (days <= 0) {
            throw new InvalidDateRangeException("La cantidad de días debe ser mayor a cero");
        }
        return new DateRange(startDate, startDate.plusDays(days - 1L));
    }

    /**
     * Calculates the inclusive duration in days.
     * Example: From 2026-01-05 to 2026-01-09 is exactly 5 days.
     */
    public int durationInDays() {
        return (int) ChronoUnit.DAYS.between(startDate, endDate) + 1;
    }

    /**
     * Alias for {@link #durationInDays()} adhering to schema conventions.
     */
    public int totalDays() {
        return durationInDays();
    }

    /**
     * Determines whether this date range overlaps with another closed interval.
     * Contiguous intervals (e.g. 1-5 and 6-10) do NOT overlap.
     */
    public boolean overlapsWith(DateRange other) {
        if (other == null) {
            return false;
        }
        return !this.startDate.isAfter(other.endDate) && !this.endDate.isBefore(other.startDate);
    }

    /**
     * Checks if the specified date falls inside this date range (inclusive).
     */
    public boolean contains(LocalDate date) {
        if (date == null) {
            return false;
        }
        return !date.isBefore(startDate) && !date.isAfter(endDate);
    }

    @Override
    public String toString() {
        return String.format("[%s al %s] (%d días)", startDate, endDate, durationInDays());
    }
}
