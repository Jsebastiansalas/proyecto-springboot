package com.renta.domain.port.in;

import com.renta.domain.model.entity.Invoice;

/**
 * Inbound port for issuing tax and commercial invoices for reservations.
 */
public interface GenerateInvoiceUseCase {

    Invoice generateInvoice(Long reservationId, Long paymentId);
}
