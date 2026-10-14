package com.renta.infrastructure.adapter.out.external;

import com.renta.domain.port.out.PaymentGatewayPort;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class MockPaymentGatewayAdapter implements PaymentGatewayPort {

    @Override
    public PaymentGatewayResult processPayment(PaymentGatewayRequest request) {
        // Simulación de pasarela de pagos exitosa (Stripe / PSE / Wompi)
        String authCode = "AUTH-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String gwRef = "GW-" + System.currentTimeMillis();
        return new PaymentGatewayResult(true, gwRef, authCode, "Transacción aprobada exitosamente por pasarela bancaria");
    }
}
