package com.renta.infrastructure.adapter.out.persistence.mapper;

import com.renta.domain.model.entity.Provider;
import com.renta.infrastructure.adapter.out.persistence.entity.ProviderJpaEntity;

public final class ProviderJpaMapper {

    private ProviderJpaMapper() {}

    public static Provider toDomain(ProviderJpaEntity entity) {
        if (entity == null) return null;
        return new Provider(
                entity.getId(),
                entity.getUserId(),
                entity.getCompanyName(),
                entity.getLegalRepresentative(),
                entity.getNitRut(),
                entity.getPhone(),
                entity.getAddress(),
                entity.getCity(),
                entity.isVerified(),
                entity.getCreatedAt()
        );
    }

    public static ProviderJpaEntity toJpa(Provider domain) {
        if (domain == null) return null;
        return new ProviderJpaEntity(
                domain.getId(),
                domain.getUserId(),
                domain.getCompanyName(),
                domain.getLegalRepresentative(),
                domain.getNitRut(),
                domain.getPhone(),
                domain.getAddress(),
                domain.getCity(),
                domain.isVerified(),
                domain.getCreatedAt()
        );
    }
}
