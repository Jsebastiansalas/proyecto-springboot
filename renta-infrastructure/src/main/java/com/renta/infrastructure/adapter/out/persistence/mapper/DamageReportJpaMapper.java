package com.renta.infrastructure.adapter.out.persistence.mapper;

import com.renta.domain.model.entity.DamageReport;
import com.renta.domain.model.enums.DamageReportStatus;
import com.renta.domain.model.enums.DamageType;
import com.renta.domain.model.vo.Money;
import com.renta.infrastructure.adapter.out.persistence.entity.DamageReportJpaEntity;

public final class DamageReportJpaMapper {

    private DamageReportJpaMapper() {}

    public static DamageReport toDomain(DamageReportJpaEntity entity) {
        if (entity == null) return null;
        DamageType type;
        try {
            type = DamageType.valueOf(entity.getDamageType());
        } catch (Exception e) {
            type = DamageType.DESGASTE_EXCESIVO;
        }

        DamageReportStatus status;
        try {
            status = DamageReportStatus.valueOf(entity.getStatus());
        } catch (Exception e) {
            status = DamageReportStatus.EVALUANDO;
        }

        return new DamageReport(
                entity.getId(),
                entity.getReturnId(),
                entity.getReportedBy(),
                type,
                entity.getDescription(),
                entity.getRepairCostEstimate() != null ? Money.cop(entity.getRepairCostEstimate()) : Money.zero(),
                status,
                entity.getCreatedAt()
        );
    }

    public static DamageReportJpaEntity toJpa(DamageReport domain) {
        if (domain == null) return null;
        return new DamageReportJpaEntity(
                domain.getId(),
                domain.getReturnId(),
                domain.getReportedBy(),
                domain.getDamageType() != null ? domain.getDamageType().name() : "DESGASTE_EXCESIVO",
                domain.getDescription(),
                domain.getRepairCostEstimate() != null ? domain.getRepairCostEstimate().amount() : null,
                domain.getStatus() != null ? domain.getStatus().name() : "EVALUANDO",
                domain.getCreatedAt()
        );
    }
}
