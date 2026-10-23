package com.renta.domain.port.out;

import com.renta.domain.model.entity.Coupon;

import java.util.List;
import java.util.Optional;

/**
 * Puerto secundario / salida (Hexagonal) para persistencia de cupones.
 */
public interface CouponRepositoryPort {

    Optional<Coupon> findByCode(String code);

    Optional<Coupon> findById(Long id);

    Coupon save(Coupon coupon);

    List<Coupon> findAllActive();

    boolean existsByCode(String code);
}
