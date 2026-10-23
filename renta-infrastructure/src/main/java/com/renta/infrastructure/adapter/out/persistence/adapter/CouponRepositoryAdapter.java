package com.renta.infrastructure.adapter.out.persistence.adapter;

import com.renta.domain.model.entity.Coupon;
import com.renta.domain.port.out.CouponRepositoryPort;
import com.renta.infrastructure.adapter.out.persistence.entity.CouponJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataCouponRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Adaptador Secundario (Hexagonal) que implementa el puerto de dominio CouponRepositoryPort.
 */
@Component
public class CouponRepositoryAdapter implements CouponRepositoryPort {

    private final SpringDataCouponRepository springRepo;

    public CouponRepositoryAdapter(SpringDataCouponRepository springRepo) {
        this.springRepo = springRepo;
    }

    @Override
    public Optional<Coupon> findByCode(String code) {
        return springRepo.findByCodeIgnoreCase(code).map(this::toDomain);
    }

    @Override
    public Optional<Coupon> findById(Long id) {
        return springRepo.findById(id).map(this::toDomain);
    }

    @Override
    public Coupon save(Coupon domain) {
        CouponJpaEntity entity = toEntity(domain);
        CouponJpaEntity saved = springRepo.save(entity);
        return toDomain(saved);
    }

    @Override
    public List<Coupon> findAllActive() {
        return springRepo.findByActiveTrue().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsByCode(String code) {
        return springRepo.existsByCodeIgnoreCase(code);
    }

    private Coupon toDomain(CouponJpaEntity entity) {
        return new Coupon(
                entity.getId(),
                entity.getCode(),
                entity.getDescription(),
                entity.getDiscountPercentage(),
                entity.getMaxDiscountAmount(),
                entity.getExpirationDate(),
                entity.getMinRentalDays(),
                entity.getMaxUses(),
                entity.getCurrentUses(),
                entity.getActive() != null ? entity.getActive() : true
        );
    }

    private CouponJpaEntity toEntity(Coupon domain) {
        CouponJpaEntity entity = new CouponJpaEntity();
        entity.setId(domain.getId());
        entity.setCode(domain.getCode());
        entity.setDescription(domain.getDescription());
        entity.setDiscountPercentage(domain.getDiscountPercentage());
        entity.setMaxDiscountAmount(domain.getMaxDiscountAmount());
        entity.setExpirationDate(domain.getExpirationDate());
        entity.setMinRentalDays(domain.getMinRentalDays());
        entity.setMaxUses(domain.getMaxUses());
        entity.setCurrentUses(domain.getCurrentUses());
        entity.setActive(domain.isActive());
        return entity;
    }
}
