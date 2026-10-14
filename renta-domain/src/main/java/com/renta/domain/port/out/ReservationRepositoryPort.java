package com.renta.domain.port.out;

import com.renta.domain.model.entity.Reservation;
import com.renta.domain.model.enums.ReservationStatus;
import com.renta.domain.model.vo.DateRange;

import java.util.List;
import java.util.Optional;

/**
 * Outbound repository port for {@link Reservation} persistence and schedule queries.
 */
public interface ReservationRepositoryPort {

    Reservation save(Reservation reservation);

    Optional<Reservation> findById(Long id);

    Optional<Reservation> findByReservationCode(String code);

    List<Reservation> findByClientId(Long clientId);

    List<Reservation> findByToolId(Long toolId);

    List<Reservation> findOverlappingReservations(Long toolId, DateRange dateRange, List<ReservationStatus> activeStatuses);

    boolean existsOverlapping(Long toolId, DateRange dateRange);

    default boolean existsOverlappingReservation(Long toolId, DateRange dateRange) {
        return existsOverlapping(toolId, dateRange);
    }
}
