package com.renta.domain.port.in;

import com.renta.domain.model.entity.Payment;

/**
 * Inbound port alias for {@link ProcessPaymentUseCase}.
 */
public interface RegisterPaymentUseCase extends ProcessPaymentUseCase {

    default Payment registerPayment(ProcessPaymentCommand command) {
        return processPayment(command);
    }
}
