package com.renta.infrastructure.adapter.out.persistence;

import com.renta.domain.model.entity.PaymentInstallment;
import com.renta.domain.model.enums.PaymentInstallmentStatus;
import com.renta.domain.port.out.PaymentInstallmentRepositoryPort;
import com.renta.infrastructure.adapter.out.persistence.entity.PaymentInstallmentJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataPaymentInstallmentRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class PaymentInstallmentRepositoryAdapter implements PaymentInstallmentRepositoryPort {

    private final SpringDataPaymentInstallmentRepository repository;

    public PaymentInstallmentRepositoryAdapter(SpringDataPaymentInstallmentRepository repository) {
        this.repository = repository;
    }

    @Override
    public PaymentInstallment save(PaymentInstallment domain) {
        PaymentInstallmentJpaEntity entity = toJpa(domain);
        PaymentInstallmentJpaEntity saved = repository.save(entity);
        return toDomain(saved);
    }

    @Override
    public List<PaymentInstallment> saveAll(List<PaymentInstallment> installments) {
        List<PaymentInstallmentJpaEntity> entities = installments.stream().map(this::toJpa).toList();
        return repository.saveAll(entities).stream().map(this::toDomain).toList();
    }

    @Override
    public Optional<PaymentInstallment> findById(Long id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public List<PaymentInstallment> findByPaymentId(Long paymentId) {
        return repository.findByPaymentIdOrderByInstallmentNumberAsc(paymentId).stream().map(this::toDomain).toList();
    }

    @Override
    public List<PaymentInstallment> findByReservationId(Long reservationId) {
        return repository.findByReservationIdOrderByInstallmentNumberAsc(reservationId).stream().map(this::toDomain).toList();
    }

    private PaymentInstallment toDomain(PaymentInstallmentJpaEntity e) {
        if (e == null) return null;
        PaymentInstallmentStatus st;
        try {
            st = PaymentInstallmentStatus.valueOf(e.getStatus());
        } catch (Exception ex) {
            st = PaymentInstallmentStatus.PENDIENTE;
        }
        return new PaymentInstallment(
                e.getId(),
                e.getPaymentId(),
                e.getReservationId(),
                e.getInstallmentNumber(),
                e.getTotalInstallments(),
                e.getDueDate(),
                e.getPrincipalAmount(),
                e.getInterestAmount(),
                e.getTotalInstallmentAmount(),
                st,
                e.getPaidAt(),
                e.getTransactionRef()
        );
    }

    private PaymentInstallmentJpaEntity toJpa(PaymentInstallment d) {
        if (d == null) return null;
        return new PaymentInstallmentJpaEntity(
                d.getId(),
                d.getPaymentId(),
                d.getReservationId(),
                d.getInstallmentNumber(),
                d.getTotalInstallments(),
                d.getDueDate(),
                d.getPrincipalAmount(),
                d.getInterestAmount(),
                d.getTotalInstallmentAmount(),
                d.getStatus() != null ? d.getStatus().name() : "PENDIENTE",
                d.getPaidAt(),
                d.getTransactionRef()
        );
    }
}
