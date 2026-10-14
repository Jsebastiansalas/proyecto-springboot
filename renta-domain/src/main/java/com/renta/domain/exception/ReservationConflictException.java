package com.renta.domain.exception;

/**
 * Thrown when a reservation cannot be scheduled due to overlapping dates with an existing active reservation.
 */
public class ReservationConflictException extends ToolNotAvailableException {

    public ReservationConflictException(String message) {
        super(message);
    }

    public ReservationConflictException(Long toolId, String dateRange) {
        super(String.format("La herramienta con ID %d ya posee una reserva confirmada en el rango: %s", toolId, dateRange));
    }
}
