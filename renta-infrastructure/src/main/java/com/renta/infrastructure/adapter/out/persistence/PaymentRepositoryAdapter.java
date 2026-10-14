package com.renta.infrastructure.adapter.out.persistence;

import com.renta.domain.model.entity.Payment;
import com.renta.domain.port.out.PaymentRepositoryPort;
import com.renta.infrastructure.adapter.out.persistence.entity.PaymentJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.mapper.PaymentJpaMapper;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataPaymentRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class PaymentRepositoryAdapter implements PaymentRepositoryPort {

    private final SpringDataPaymentRepository repository;

    public PaymentRepositoryAdapter(SpringDataPaymentRepository repository) {
        this.repository = repository;
    }

    @Override
    public Payment save(Payment payment) {
        PaymentJpaEntity entity = PaymentJpaMapper.toJpa(payment);
        PaymentJpaEntity saved = repository.save(entity);
        return PaymentJpaMapper.toDomain(saved);
    }

    @Override
    public Optional<Payment> findById(Long id) {
        return repository.findById(id).map(PaymentJpaMapper::toDomain);
    }

    @Override
    public Optional<Payment> findByTransactionReference(String reference) {
        return repository.findByTransactionReference(reference).map(PaymentJpaMapper::toDomain);
    }

    @Override
    public Optional<Payment> findByReservationId(Long reservationId) {
        return repository.findByReservationId(reservationId).map(PaymentJpaMapper::toDomain);
    }
}
