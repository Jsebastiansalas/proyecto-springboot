package com.renta.infrastructure.adapter.out.persistence.mapper;

import com.renta.domain.model.entity.Reservation;
import com.renta.domain.model.enums.ReservationStatus;
import com.renta.domain.model.vo.DateRange;
import com.renta.domain.model.vo.Money;
import com.renta.infrastructure.adapter.out.persistence.entity.ReservationJpaEntity;

public final class ReservationJpaMapper {

    private ReservationJpaMapper() {}

    public static Reservation toDomain(ReservationJpaEntity entity) {
        if (entity == null) return null;
        ReservationStatus status;
        try {
            status = ReservationStatus.valueOf(entity.getStatus());
        } catch (Exception e) {
            status = ReservationStatus.PENDIENTE;
        }

        DateRange dateRange = DateRange.of(entity.getStartDate(), entity.getEndDate());

        return new Reservation(
                entity.getId(),
                entity.getReservationCode(),
                entity.getClientId(),
                entity.getToolId(),
                dateRange,
                entity.getTotalDays(),
                entity.getSubtotal() != null ? Money.cop(entity.getSubtotal()) : null,
                entity.getDepositTotal() != null ? Money.cop(entity.getDepositTotal()) : null,
                entity.getTotalAmount() != null ? Money.cop(entity.getTotalAmount()) : null,
                status,
                entity.getNotes(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public static ReservationJpaEntity toJpa(Reservation domain) {
        if (domain == null) return null;
        return new ReservationJpaEntity(
                domain.getId(),
                domain.getReservationCode(),
                domain.getClientId(),
                domain.getToolId(),
                domain.getDateRange() != null ? domain.getDateRange().startDate() : null,
                domain.getDateRange() != null ? domain.getDateRange().endDate() : null,
                domain.getTotalDays(),
                domain.getSubtotal() != null ? domain.getSubtotal().amount() : null,
                domain.getDepositTotal() != null ? domain.getDepositTotal().amount() : null,
                domain.getTotalAmount() != null ? domain.getTotalAmount().amount() : null,
                domain.getStatus() != null ? domain.getStatus().name() : "PENDIENTE",
                domain.getNotes(),
                domain.getCreatedAt(),
                domain.getUpdatedAt()
        );
    }
}
