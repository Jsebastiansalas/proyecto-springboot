package com.renta.application.mapper;

import com.renta.application.dto.reservation.ReservationResponse;
import com.renta.domain.model.entity.Reservation;

public final class ReservationDtoMapper {

    private ReservationDtoMapper() {}

    public static ReservationResponse toResponse(Reservation res, String clientName, String toolName, String toolImageUrl) {
        if (res == null) return null;
        return new ReservationResponse(
                res.getId(),
                res.getReservationCode(),
                res.getClientId(),
                clientName,
                res.getToolId(),
                toolName,
                toolImageUrl,
                res.getDateRange() != null ? res.getDateRange().startDate() : null,
                res.getDateRange() != null ? res.getDateRange().endDate() : null,
                res.getTotalDays(),
                res.getSubtotal() != null ? res.getSubtotal().amount() : null,
                res.getDepositTotal() != null ? res.getDepositTotal().amount() : null,
                res.getTotalAmount() != null ? res.getTotalAmount().amount() : null,
                res.getStatus(),
                res.getNotes(),
                res.getCreatedAt(),
                res.getUpdatedAt()
        );
    }
}
