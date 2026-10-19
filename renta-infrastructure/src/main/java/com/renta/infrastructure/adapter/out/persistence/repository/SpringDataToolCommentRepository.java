package com.renta.infrastructure.adapter.out.persistence.repository;

import com.renta.infrastructure.adapter.out.persistence.entity.ToolCommentJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpringDataToolCommentRepository extends JpaRepository<ToolCommentJpaEntity, Long> {
    List<ToolCommentJpaEntity> findByToolIdOrderByCreatedAtDesc(Long toolId);
}
