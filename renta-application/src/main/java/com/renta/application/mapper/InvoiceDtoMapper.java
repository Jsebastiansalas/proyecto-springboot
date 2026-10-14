package com.renta.application.mapper;

import com.renta.application.dto.invoice.InvoiceResponse;
import com.renta.domain.model.entity.Invoice;

public final class InvoiceDtoMapper {

    private InvoiceDtoMapper() {}

    public static InvoiceResponse toResponse(Invoice inv, String reservationCode, String clientName, String clientDocument, String toolName) {
        if (inv == null) return null;
        return new InvoiceResponse(
                inv.getId(),
                inv.getInvoiceNumber(),
                inv.getReservationId(),
                reservationCode,
                inv.getPaymentId(),
                clientName,
                clientDocument,
                toolName,
                inv.getIssueDate(),
                inv.getSubtotal() != null ? inv.getSubtotal().amount() : null,
                inv.getTaxAmount() != null ? inv.getTaxAmount().amount() : null,
                inv.getTotal() != null ? inv.getTotal().amount() : null,
                inv.getStatus(),
                inv.getPdfUrl()
        );
    }
}
