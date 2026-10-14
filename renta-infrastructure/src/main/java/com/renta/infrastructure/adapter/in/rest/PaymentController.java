package com.renta.infrastructure.adapter.in.rest;

import com.renta.application.dto.payment.PaymentResponse;
import com.renta.application.dto.payment.ProcessPaymentRequest;
import com.renta.application.service.PaymentApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payments")
@Tag(name = "4. Pasarela y Transacciones de Pago", description = "Procesamiento de pagos de reservas, generación automática de factura y comprobante")
public class PaymentController {

    private final PaymentApplicationService paymentService;

    public PaymentController(PaymentApplicationService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/process")
    @PreAuthorize("hasAnyRole('CLIENTE', 'ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Procesar pago de reserva", description = "Procesa el pago con la pasarela integrada, actualiza el estado de la reserva y genera automáticamente la factura fiscal.")
    public ResponseEntity<PaymentResponse> processPayment(@Valid @RequestBody ProcessPaymentRequest request) {
        PaymentResponse response = paymentService.processFromRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/reservation/{reservationId}")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Consultar pago de una reserva", description = "Obtiene el detalle de la transacción de pago realizada para una reserva determinada.")
    public ResponseEntity<PaymentResponse> getPaymentByReservationId(@PathVariable Long reservationId) {
        return ResponseEntity.ok(paymentService.getPaymentByReservationId(reservationId));
    }
}
