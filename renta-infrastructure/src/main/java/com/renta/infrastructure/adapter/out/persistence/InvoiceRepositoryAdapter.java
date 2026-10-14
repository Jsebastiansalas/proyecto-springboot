package com.renta.infrastructure.adapter.out.persistence;

import com.renta.domain.model.entity.Invoice;
import com.renta.domain.port.out.InvoiceRepositoryPort;
import com.renta.infrastructure.adapter.out.persistence.entity.InvoiceJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.mapper.InvoiceJpaMapper;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataInvoiceRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class InvoiceRepositoryAdapter implements InvoiceRepositoryPort {

    private final SpringDataInvoiceRepository repository;

    public InvoiceRepositoryAdapter(SpringDataInvoiceRepository repository) {
        this.repository = repository;
    }

    @Override
    public Invoice save(Invoice invoice) {
        InvoiceJpaEntity entity = InvoiceJpaMapper.toJpa(invoice);
        InvoiceJpaEntity saved = repository.save(entity);
        return InvoiceJpaMapper.toDomain(saved);
    }

    @Override
    public Optional<Invoice> findById(Long id) {
        return repository.findById(id).map(InvoiceJpaMapper::toDomain);
    }

    @Override
    public Optional<Invoice> findByInvoiceNumber(String invoiceNumber) {
        return repository.findByInvoiceNumber(invoiceNumber).map(InvoiceJpaMapper::toDomain);
    }

    @Override
    public Optional<Invoice> findByReservationId(Long reservationId) {
        return repository.findByReservationId(reservationId).map(InvoiceJpaMapper::toDomain);
    }
}
