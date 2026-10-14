package com.renta.infrastructure.adapter.out.persistence.repository;

import com.renta.infrastructure.adapter.out.persistence.entity.ReviewJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpringDataReviewRepository extends JpaRepository<ReviewJpaEntity, Long> {

    List<ReviewJpaEntity> findByToolIdOrderByCreatedAtDesc(Long toolId);

    Optional<ReviewJpaEntity> findByReservationId(Long reservationId);

    List<ReviewJpaEntity> findByClientIdOrderByCreatedAtDesc(Long clientId);
}
