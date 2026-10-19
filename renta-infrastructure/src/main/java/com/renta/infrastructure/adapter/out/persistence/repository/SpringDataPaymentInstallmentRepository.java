package com.renta.infrastructure.adapter.out.persistence.repository;

import com.renta.infrastructure.adapter.out.persistence.entity.PaymentInstallmentJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpringDataPaymentInstallmentRepository extends JpaRepository<PaymentInstallmentJpaEntity, Long> {
    List<PaymentInstallmentJpaEntity> findByPaymentIdOrderByInstallmentNumberAsc(Long paymentId);
    List<PaymentInstallmentJpaEntity> findByReservationIdOrderByInstallmentNumberAsc(Long reservationId);
}
