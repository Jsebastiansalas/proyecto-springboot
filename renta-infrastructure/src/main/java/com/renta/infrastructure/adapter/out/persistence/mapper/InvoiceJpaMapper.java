package com.renta.infrastructure.adapter.out.persistence.mapper;

import com.renta.domain.model.entity.Invoice;
import com.renta.domain.model.enums.InvoiceStatus;
import com.renta.domain.model.vo.Money;
import com.renta.infrastructure.adapter.out.persistence.entity.InvoiceJpaEntity;

public final class InvoiceJpaMapper {

    private InvoiceJpaMapper() {}

    public static Invoice toDomain(InvoiceJpaEntity entity) {
        if (entity == null) return null;
        InvoiceStatus status;
        try {
            status = InvoiceStatus.valueOf(entity.getStatus());
        } catch (Exception e) {
            status = InvoiceStatus.EMITIDA;
        }

        return new Invoice(
                entity.getId(),
                entity.getInvoiceNumber(),
                entity.getReservationId(),
                entity.getPaymentId(),
                entity.getIssueDate(),
                entity.getSubtotal() != null ? Money.cop(entity.getSubtotal()) : null,
                entity.getTaxAmount() != null ? Money.cop(entity.getTaxAmount()) : null,
                entity.getTotal() != null ? Money.cop(entity.getTotal()) : null,
                status,
                entity.getPdfUrl()
        );
    }

    public static InvoiceJpaEntity toJpa(Invoice domain) {
        if (domain == null) return null;
        return new InvoiceJpaEntity(
                domain.getId(),
                domain.getInvoiceNumber(),
                domain.getReservationId(),
                domain.getPaymentId(),
                domain.getIssueDate(),
                domain.getSubtotal() != null ? domain.getSubtotal().amount() : null,
                domain.getTaxAmount() != null ? domain.getTaxAmount().amount() : null,
                domain.getTotal() != null ? domain.getTotal().amount() : null,
                domain.getStatus() != null ? domain.getStatus().name() : "EMITIDA",
                domain.getPdfUrl()
        );
    }
}
