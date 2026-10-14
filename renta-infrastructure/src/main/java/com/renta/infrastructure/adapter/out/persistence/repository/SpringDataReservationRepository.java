package com.renta.infrastructure.adapter.out.persistence.repository;

import com.renta.infrastructure.adapter.out.persistence.entity.ReservationJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface SpringDataReservationRepository extends JpaRepository<ReservationJpaEntity, Long> {

    Optional<ReservationJpaEntity> findByReservationCode(String reservationCode);

    List<ReservationJpaEntity> findByClientId(Long clientId);

    List<ReservationJpaEntity> findByToolId(Long toolId);

    @Query("SELECT r FROM ReservationJpaEntity r WHERE r.toolId = :toolId " +
            "AND r.status IN :statuses " +
            "AND r.startDate <= :endDate AND r.endDate >= :startDate")
    List<ReservationJpaEntity> findOverlapping(
            @Param("toolId") Long toolId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("statuses") Collection<String> statuses
    );

    @Query("SELECT COUNT(r) > 0 FROM ReservationJpaEntity r WHERE r.toolId = :toolId " +
            "AND r.status IN ('PENDIENTE', 'APROBADA', 'EN_CURSO') " +
            "AND r.startDate <= :endDate AND r.endDate >= :startDate")
    boolean existsOverlapping(
            @Param("toolId") Long toolId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
