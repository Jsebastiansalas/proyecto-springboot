package com.renta.infrastructure.adapter.out.persistence.repository;

import com.renta.infrastructure.adapter.out.persistence.entity.ReservationStatusAuditLogJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpringDataReservationAuditLogRepository extends JpaRepository<ReservationStatusAuditLogJpaEntity, Long> {

    List<ReservationStatusAuditLogJpaEntity> findByReservationIdOrderByChangedAtDesc(Long reservationId);
}
