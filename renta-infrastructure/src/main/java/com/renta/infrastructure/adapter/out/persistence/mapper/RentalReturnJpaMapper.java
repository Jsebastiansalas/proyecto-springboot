package com.renta.infrastructure.adapter.out.persistence.mapper;

import com.renta.domain.model.entity.RentalReturn;
import com.renta.domain.model.enums.ToolConditionStatus;
import com.renta.domain.model.vo.Money;
import com.renta.infrastructure.adapter.out.persistence.entity.RentalReturnJpaEntity;

public final class RentalReturnJpaMapper {

    private RentalReturnJpaMapper() {}

    public static RentalReturn toDomain(RentalReturnJpaEntity entity) {
        if (entity == null) return null;
        ToolConditionStatus cond;
        try {
            cond = ToolConditionStatus.valueOf(entity.getToolConditionStatus());
        } catch (Exception e) {
            cond = ToolConditionStatus.BUENO;
        }

        return new RentalReturn(
                entity.getId(),
                entity.getReservationId(),
                entity.getReturnDate(),
                entity.getReceivedBy(),
                cond,
                entity.getInspectionNotes(),
                entity.isDepositRefunded(),
                entity.getExtraDamageFee() != null ? Money.cop(entity.getExtraDamageFee()) : Money.zero()
        );
    }

    public static RentalReturnJpaEntity toJpa(RentalReturn domain) {
        if (domain == null) return null;
        return new RentalReturnJpaEntity(
                domain.getId(),
                domain.getReservationId(),
                domain.getReturnDate(),
                domain.getReceivedBy(),
                domain.getToolConditionStatus() != null ? domain.getToolConditionStatus().name() : "BUENO",
                domain.getInspectionNotes(),
                domain.isDepositRefunded(),
                domain.getExtraDamageFee() != null ? domain.getExtraDamageFee().amount() : null
        );
    }
}
