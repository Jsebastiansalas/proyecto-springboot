package com.renta.domain.port.in;

import com.renta.domain.model.entity.Payment;
import com.renta.domain.model.enums.PaymentMethod;
import com.renta.domain.model.vo.Money;

/**
 * Inbound port for initiating and recording payment transactions.
 */
public interface ProcessPaymentUseCase {

    Payment processPayment(ProcessPaymentCommand command);

    record ProcessPaymentCommand(
            Long reservationId,
            Long clientId,
            PaymentMethod method,
            Money amount,
            String gatewayReference
    ) {}
}
