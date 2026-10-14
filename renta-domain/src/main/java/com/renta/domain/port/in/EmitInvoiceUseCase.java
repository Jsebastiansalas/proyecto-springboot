package com.renta.domain.port.in;

import com.renta.domain.model.entity.Invoice;

/**
 * Inbound port alias for {@link GenerateInvoiceUseCase}.
 */
public interface EmitInvoiceUseCase extends GenerateInvoiceUseCase {

    default Invoice emitInvoice(Long reservationId, Long paymentId) {
        return generateInvoice(reservationId, paymentId);
    }
}
