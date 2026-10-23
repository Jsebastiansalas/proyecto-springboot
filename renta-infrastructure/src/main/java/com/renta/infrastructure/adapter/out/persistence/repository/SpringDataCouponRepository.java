package com.renta.infrastructure.adapter.out.persistence.repository;

import com.renta.infrastructure.adapter.out.persistence.entity.CouponJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpringDataCouponRepository extends JpaRepository<CouponJpaEntity, Long> {

    Optional<CouponJpaEntity> findByCodeIgnoreCase(String code);

    List<CouponJpaEntity> findByActiveTrue();

    boolean existsByCodeIgnoreCase(String code);
}
