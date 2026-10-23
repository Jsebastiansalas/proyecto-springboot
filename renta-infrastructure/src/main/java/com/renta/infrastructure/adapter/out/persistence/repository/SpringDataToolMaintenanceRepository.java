package com.renta.infrastructure.adapter.out.persistence.repository;

import com.renta.infrastructure.adapter.out.persistence.entity.ToolMaintenanceJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpringDataToolMaintenanceRepository extends JpaRepository<ToolMaintenanceJpaEntity, Long> {

    List<ToolMaintenanceJpaEntity> findByToolIdOrderByStartDateDesc(Long toolId);

    List<ToolMaintenanceJpaEntity> findByStatus(String status);
}
