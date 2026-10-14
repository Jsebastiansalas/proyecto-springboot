package com.renta.domain.port.out;

import com.renta.domain.model.entity.Payment;

import java.util.Optional;

/**
 * Outbound repository port for {@link Payment} persistence and lookup.
 */
public interface PaymentRepositoryPort {

    Payment save(Payment payment);

    Optional<Payment> findById(Long id);

    Optional<Payment> findByTransactionReference(String reference);

    Optional<Payment> findByReservationId(Long reservationId);
}
