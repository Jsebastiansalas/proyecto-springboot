package com.renta.infrastructure.adapter.out.persistence.repository;

import com.renta.infrastructure.adapter.out.persistence.entity.ToolJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpringDataToolRepository extends JpaRepository<ToolJpaEntity, Long> {

    Optional<ToolJpaEntity> findByCodeSku(String codeSku);

    List<ToolJpaEntity> findByCategoryId(Integer categoryId);

    List<ToolJpaEntity> findByProviderId(Long providerId);

    List<ToolJpaEntity> findByStatus(String status);
}
