package com.renta.domain.port.out;

import com.renta.domain.model.entity.Review;

import java.util.List;
import java.util.Optional;

/**
 * Outbound repository port for {@link Review} persistence.
 */
public interface ReviewRepositoryPort {
    Review save(Review review);
    Optional<Review> findById(Long id);
    Optional<Review> findByReservationId(Long reservationId);
    List<Review> findByToolId(Long toolId);
    List<Review> findByClientId(Long clientId);
}
