package com.renta.domain.port.out;

import com.renta.domain.model.entity.RentalReturn;

import java.util.Optional;

/**
 * Outbound repository port for {@link RentalReturn} persistence.
 */
public interface RentalReturnRepositoryPort {

    RentalReturn save(RentalReturn rentalReturn);

    Optional<RentalReturn> findById(Long id);

    Optional<RentalReturn> findByReservationId(Long reservationId);
}
