package com.renta.infrastructure.adapter.out.persistence.repository;

import com.renta.infrastructure.adapter.out.persistence.entity.InvoiceJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpringDataInvoiceRepository extends JpaRepository<InvoiceJpaEntity, Long> {
    Optional<InvoiceJpaEntity> findByReservationId(Long reservationId);
    Optional<InvoiceJpaEntity> findByInvoiceNumber(String invoiceNumber);
}
