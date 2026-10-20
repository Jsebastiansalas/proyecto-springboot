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

/**
 * ============================================================================
 * ADAPTADOR PRIMARIO REST: CONTROLADOR DE PAGOS Y TRANSACCIONES
 * ============================================================================
 * 
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Expone los endpoints HTTP bajo `/api/v1/payments`:
 * 1. `POST /api/v1/payments/process`: Procesa transacciones con validación de montos y emite factura.
 * 2. `GET /api/v1/payments/reservation/{id}`: Consulta el comprobante de pago de una reserva.
 * 
 * ¿POR QUÉ ESTÁ CREADO Y DÓNDE ENCAJA EN LA ARQUITECTURA?
 * En la Arquitectura Hexagonal, es el punto de enlace entre la pasarela web
 * del cliente y el servicio {@link PaymentApplicationService}, asegurando que
 * solo el titular de la reserva (`@authz.canAccessReservation`) o un ADMIN puedan pagar.
 */
@RestController
@RequestMapping("/api/v1/payments")
@Tag(name = "4. Pasarela y Transacciones de Pago", description = "Procesamiento de pagos de reservas, generación automática de factura y comprobante")
public class PaymentController {

    private final PaymentApplicationService paymentService;

    public PaymentController(PaymentApplicationService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/process")
    @PreAuthorize("hasAnyRole('CLIENTE', 'ADMIN') and @authz.canAccessReservation(principal, #request.reservationId())")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Procesar pago de reserva", description = "Procesa el pago con la pasarela integrada, actualiza el estado de la reserva y genera automáticamente la factura fiscal. Restringido al titular o ADMIN.")
    public ResponseEntity<PaymentResponse> processPayment(@Valid @RequestBody ProcessPaymentRequest request) {
        PaymentResponse response = paymentService.processFromRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/reservation/{reservationId}")
    @PreAuthorize("@authz.canAccessReservation(principal, #reservationId)")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Consultar pago de una reserva", description = "Obtiene el detalle de la transacción de pago realizada para una reserva determinada. Restringido a las partes de la reserva o ADMIN.")
    public ResponseEntity<PaymentResponse> getPaymentByReservationId(@PathVariable Long reservationId) {
        return ResponseEntity.ok(paymentService.getPaymentByReservationId(reservationId));
    }

    @GetMapping("/reservation/{reservationId}/installments")
    @PreAuthorize("@authz.canAccessReservation(principal, #reservationId)")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Consultar cronograma de cuotas", description = "Obtiene el desglose de cuotas pagadas y pendientes para una reserva financiada. Restringido al titular o ADMIN.")
    public ResponseEntity<com.renta.application.dto.payment.InstallmentPlanSummaryResponse> getReservationInstallments(@PathVariable Long reservationId) {
        return ResponseEntity.ok(paymentService.getReservationInstallments(reservationId));
    }

    @PostMapping("/installments/{installmentId}/pay")
    @PreAuthorize("hasAnyRole('CLIENTE', 'ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Pagar cuota individual", description = "Procesa el pago de una cuota pendiente del cronograma de financiación.")
    public ResponseEntity<com.renta.application.dto.payment.PaymentInstallmentResponse> payInstallment(@PathVariable Long installmentId) {
        return ResponseEntity.ok(paymentService.payInstallment(installmentId));
    }
}
