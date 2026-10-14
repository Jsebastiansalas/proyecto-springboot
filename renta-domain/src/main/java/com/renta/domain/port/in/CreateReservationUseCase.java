package com.renta.domain.port.in;

import com.renta.domain.model.entity.Reservation;

import java.time.LocalDate;

/**
 * Inbound port for creating customer equipment reservations.
 */
public interface CreateReservationUseCase {

    Reservation createReservation(CreateReservationCommand command);

    record CreateReservationCommand(
            Long clientId,
            Long toolId,
            LocalDate startDate,
            LocalDate endDate,
            String notes
    ) {}
}
