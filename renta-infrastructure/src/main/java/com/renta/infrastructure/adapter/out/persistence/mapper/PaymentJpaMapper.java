package com.renta.infrastructure.adapter.out.persistence.mapper;

import com.renta.domain.model.entity.Payment;
import com.renta.domain.model.enums.PaymentMethod;
import com.renta.domain.model.enums.PaymentStatus;
import com.renta.domain.model.vo.Money;
import com.renta.infrastructure.adapter.out.persistence.entity.PaymentJpaEntity;

public final class PaymentJpaMapper {

    private PaymentJpaMapper() {}

    public static Payment toDomain(PaymentJpaEntity entity) {
        if (entity == null) return null;
        PaymentMethod method;
        try {
            method = PaymentMethod.valueOf(entity.getPaymentMethod());
        } catch (Exception e) {
            method = PaymentMethod.TARJETA_CREDITO;
        }

        PaymentStatus status;
        try {
            status = PaymentStatus.valueOf(entity.getPaymentStatus());
        } catch (Exception e) {
            status = PaymentStatus.COMPLETADO;
        }

        return new Payment(
                entity.getId(),
                entity.getTransactionReference(),
                entity.getReservationId(),
                entity.getClientId(),
                method,
                entity.getAmount() != null ? Money.cop(entity.getAmount()) : null,
                status,
                entity.getPaymentDate(),
                entity.getGatewayReference()
        );
    }

    public static PaymentJpaEntity toJpa(Payment domain) {
        if (domain == null) return null;
        return new PaymentJpaEntity(
                domain.getId(),
                domain.getTransactionReference(),
                domain.getReservationId(),
                domain.getClientId(),
                domain.getPaymentMethod() != null ? domain.getPaymentMethod().name() : "TARJETA_CREDITO",
                domain.getAmount() != null ? domain.getAmount().amount() : null,
                domain.getPaymentStatus() != null ? domain.getPaymentStatus().name() : "COMPLETADO",
                domain.getPaymentDate(),
                domain.getGatewayReference()
        );
    }
}
