package com.renta.infrastructure.adapter.out.persistence.repository;

import com.renta.infrastructure.adapter.out.persistence.entity.DamageReportJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpringDataDamageReportRepository extends JpaRepository<DamageReportJpaEntity, Long> {
    List<DamageReportJpaEntity> findByReturnId(Long returnId);
}
