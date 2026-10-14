package com.renta.infrastructure.adapter.out.persistence.repository;

import com.renta.infrastructure.adapter.out.persistence.entity.RentalReturnJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpringDataRentalReturnRepository extends JpaRepository<RentalReturnJpaEntity, Long> {
    Optional<RentalReturnJpaEntity> findByReservationId(Long reservationId);
}
