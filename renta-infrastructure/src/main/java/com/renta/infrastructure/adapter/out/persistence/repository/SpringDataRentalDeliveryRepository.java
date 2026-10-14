package com.renta.infrastructure.adapter.out.persistence.repository;

import com.renta.infrastructure.adapter.out.persistence.entity.RentalDeliveryJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpringDataRentalDeliveryRepository extends JpaRepository<RentalDeliveryJpaEntity, Long> {
    Optional<RentalDeliveryJpaEntity> findByReservationId(Long reservationId);
}
