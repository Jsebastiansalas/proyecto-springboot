package com.renta.domain.port.in;

import com.renta.domain.model.entity.Reservation;

/**
 * Inbound port for canceling a reservation.
 */
public interface CancelReservationUseCase {

    Reservation cancelReservation(Long reservationId, String reason);

    default Reservation cancel(Long reservationId, String reason) {
        return cancelReservation(reservationId, reason);
    }
}
