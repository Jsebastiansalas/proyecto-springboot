package com.renta.domain.port.out;

import com.renta.domain.model.entity.RentalDelivery;

import java.util.Optional;

/**
 * Outbound repository port for {@link RentalDelivery} persistence.
 */
public interface RentalDeliveryRepositoryPort {

    RentalDelivery save(RentalDelivery delivery);

    Optional<RentalDelivery> findById(Long id);

    Optional<RentalDelivery> findByReservationId(Long reservationId);
}
