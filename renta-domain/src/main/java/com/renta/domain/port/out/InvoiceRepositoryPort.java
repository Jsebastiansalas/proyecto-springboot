package com.renta.domain.port.out;

import com.renta.domain.model.entity.Invoice;

import java.util.Optional;

/**
 * Outbound repository port for {@link Invoice} persistence and retrieval.
 */
public interface InvoiceRepositoryPort {

    Invoice save(Invoice invoice);

    Optional<Invoice> findById(Long id);

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    Optional<Invoice> findByReservationId(Long reservationId);
}
