package com.renta.domain.port.out;

import com.renta.domain.model.enums.PaymentMethod;
import com.renta.domain.model.vo.Money;

/**
 * Outbound SPI port for external payment gateways.
 */
public interface PaymentGatewayPort {

    PaymentGatewayResult processPayment(PaymentGatewayRequest request);

    record PaymentGatewayRequest(
            String transactionReference,
            Money amount,
            PaymentMethod method,
            String customerEmail
    ) {}

    record PaymentGatewayResult(
            boolean successful,
            String gatewayReference,
            String authorizationCode,
            String message
    ) {}
}
