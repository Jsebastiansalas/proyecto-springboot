package com.renta.infrastructure.adapter.out.persistence.repository;

import com.renta.infrastructure.adapter.out.persistence.entity.ClientFavoriteId;
import com.renta.infrastructure.adapter.out.persistence.entity.ClientFavoriteJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpringDataClientFavoriteRepository extends JpaRepository<ClientFavoriteJpaEntity, ClientFavoriteId> {

    @Query("SELECT f.id.toolId FROM ClientFavoriteJpaEntity f WHERE f.id.clientId = :clientId ORDER BY f.addedAt DESC")
    List<Long> findFavoriteToolIdsByClientId(@Param("clientId") Long clientId);
}
