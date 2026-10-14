package com.renta.infrastructure.adapter.out.persistence.repository;

import com.renta.infrastructure.adapter.out.persistence.entity.ClientJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpringDataClientRepository extends JpaRepository<ClientJpaEntity, Long> {
    Optional<ClientJpaEntity> findByUserId(Long userId);
    Optional<ClientJpaEntity> findByDocumentNumber(String documentNumber);
}
