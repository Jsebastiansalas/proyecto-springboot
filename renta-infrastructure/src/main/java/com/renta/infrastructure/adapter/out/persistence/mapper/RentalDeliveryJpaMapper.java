package com.renta.infrastructure.adapter.out.persistence.mapper;

import com.renta.domain.model.entity.RentalDelivery;
import com.renta.infrastructure.adapter.out.persistence.entity.RentalDeliveryJpaEntity;

public final class RentalDeliveryJpaMapper {

    private RentalDeliveryJpaMapper() {}

    public static RentalDelivery toDomain(RentalDeliveryJpaEntity entity) {
        if (entity == null) return null;
        return new RentalDelivery(
                entity.getId(),
                entity.getReservationId(),
                entity.getDeliveryDate(),
                entity.getDeliveredBy(),
                entity.getInitialConditionNotes(),
                entity.isClientSignatureAck()
        );
    }

    public static RentalDeliveryJpaEntity toJpa(RentalDelivery domain) {
        if (domain == null) return null;
        return new RentalDeliveryJpaEntity(
                domain.getId(),
                domain.getReservationId(),
                domain.getDeliveryDate(),
                domain.getDeliveredBy(),
                domain.getInitialConditionNotes(),
                domain.isClientSignatureAck()
        );
    }
}
