package com.renta.domain.model.enums;

/**
 * Enumeration representing the lifecycle states of a rental reservation.
 */
public enum ReservationStatus {
    PENDIENTE,
    APROBADA,
    EN_CURSO,
    FINALIZADA,
    CANCELADA,
    RECHAZADA;

    /**
     * Checks if this status is terminal (no further transitions allowed).
     */
    public boolean isTerminal() {
        return this == FINALIZADA || this == CANCELADA || this == RECHAZADA;
    }

    /**
     * Validates whether a state transition from this status to target is legally permitted.
     */
    public boolean canTransitionTo(ReservationStatus target) {
        if (target == null || this == target) {
            return false;
        }
        return switch (this) {
            case PENDIENTE -> target == APROBADA || target == RECHAZADA || target == CANCELADA;
            case APROBADA -> target == EN_CURSO || target == CANCELADA;
            case EN_CURSO -> target == FINALIZADA;
            case FINALIZADA, CANCELADA, RECHAZADA -> false;
        };
    }
}
