package com.renta.infrastructure.adapter.out.persistence.repository;

import com.renta.infrastructure.adapter.out.persistence.entity.DeliveryChecklistJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpringDataDeliveryChecklistRepository extends JpaRepository<DeliveryChecklistJpaEntity, Long> {
    Optional<DeliveryChecklistJpaEntity> findByDeliveryId(Long deliveryId);
}
