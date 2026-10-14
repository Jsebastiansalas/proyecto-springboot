package com.renta.domain.port.in;

import com.renta.domain.model.entity.Reservation;

/**
 * Inbound port for rejecting a pending reservation.
 */
public interface RejectReservationUseCase {

    Reservation rejectReservation(Long reservationId, String reason);
}
