package com.renta.application.mapper;

import com.renta.application.dto.delivery.DamageReportResponse;
import com.renta.application.dto.delivery.RentalDeliveryResponse;
import com.renta.application.dto.delivery.RentalReturnResponse;
import com.renta.domain.model.entity.DamageReport;
import com.renta.domain.model.entity.RentalDelivery;
import com.renta.domain.model.entity.RentalReturn;

public final class DeliveryReturnDtoMapper {

    private DeliveryReturnDtoMapper() {}

    public static RentalDeliveryResponse toDeliveryResponse(RentalDelivery d, String reservationCode) {
        if (d == null) return null;
        return new RentalDeliveryResponse(
                d.getId(),
                d.getReservationId(),
                reservationCode,
                d.getDeliveryDate(),
                d.getDeliveredBy(),
                d.getInitialConditionNotes(),
                d.isClientSignatureAck()
        );
    }

    public static RentalReturnResponse toReturnResponse(RentalReturn r, String reservationCode) {
        if (r == null) return null;
        return new RentalReturnResponse(
                r.getId(),
                r.getReservationId(),
                reservationCode,
                r.getReturnDate(),
                r.getReceivedBy(),
                r.getToolConditionStatus(),
                r.getInspectionNotes(),
                r.isDepositRefunded(),
                r.getExtraDamageFee() != null ? r.getExtraDamageFee().amount() : null
        );
    }

    public static DamageReportResponse toDamageResponse(DamageReport rep) {
        if (rep == null) return null;
        return new DamageReportResponse(
                rep.getId(),
                rep.getReturnId(),
                rep.getReportedBy(),
                rep.getDamageType(),
                rep.getDescription(),
                rep.getRepairCostEstimate() != null ? rep.getRepairCostEstimate().amount() : null,
                rep.getStatus(),
                rep.getCreatedAt()
        );
    }
}
