package com.renta.domain.port.out;

import com.renta.domain.model.entity.PaymentInstallment;

import java.util.List;
import java.util.Optional;

/**
 * Output port for managing payment installments in persistence (4FN).
 */
public interface PaymentInstallmentRepositoryPort {

    PaymentInstallment save(PaymentInstallment installment);

    List<PaymentInstallment> saveAll(List<PaymentInstallment> installments);

    Optional<PaymentInstallment> findById(Long id);

    List<PaymentInstallment> findByPaymentId(Long paymentId);

    List<PaymentInstallment> findByReservationId(Long reservationId);
}
