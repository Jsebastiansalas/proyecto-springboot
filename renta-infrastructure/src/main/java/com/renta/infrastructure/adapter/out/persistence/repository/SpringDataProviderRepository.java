package com.renta.infrastructure.adapter.out.persistence.repository;

import com.renta.infrastructure.adapter.out.persistence.entity.ProviderJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpringDataProviderRepository extends JpaRepository<ProviderJpaEntity, Long> {
    Optional<ProviderJpaEntity> findByUserId(Long userId);
    Optional<ProviderJpaEntity> findByNitRut(String nitRut);
}
