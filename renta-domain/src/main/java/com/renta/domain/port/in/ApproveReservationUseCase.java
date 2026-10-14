package com.renta.domain.port.in;

import com.renta.domain.model.entity.Reservation;

/**
 * Inbound port for approving a pending reservation.
 */
public interface ApproveReservationUseCase {

    Reservation approveReservation(Long reservationId);

    default Reservation approve(Long reservationId) {
        return approveReservation(reservationId);
    }
}
