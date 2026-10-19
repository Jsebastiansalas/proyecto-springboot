package com.renta.infrastructure.adapter.in.rest;

import com.renta.application.dto.reservation.CalculatePriceRequest;
import com.renta.application.dto.reservation.CreateReservationRequest;
import com.renta.application.dto.reservation.PriceCalculationResponse;
import com.renta.application.dto.reservation.ReservationResponse;
import com.renta.application.service.ReservationApplicationService;
import com.renta.domain.model.entity.Reservation;
import com.renta.infrastructure.adapter.out.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reservations")
@Tag(name = "3. Reservas y Alquileres", description = "Endpoints para cotización dinámica, creación y ciclo de vida de reservas")
public class ReservationController {

    private final ReservationApplicationService reservationService;

    public ReservationController(ReservationApplicationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping("/calculate-price")
    @Operation(summary = "Cotizador dinámico de alquiler", description = "Calcula el costo total del alquiler aplicando tarifa diaria o semanal (descuento 15% para 7+ días), IVA del 19% y depósito de garantía requerido.")
    public ResponseEntity<PriceCalculationResponse> calculatePrice(@Valid @RequestBody CalculatePriceRequest request) {
        PriceCalculationResponse response = reservationService.calculatePriceDetailed(
                request.toolId(),
                request.startDate(),
                request.endDate()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CLIENTE', 'ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Crear nueva reserva", description = "Genera una reserva validando disponibilidad de la herramienta y solapamiento de fechas con reservas previas.")
    public ResponseEntity<ReservationResponse> createReservation(@Valid @RequestBody CreateReservationRequest request) {
        ReservationResponse response = reservationService.createFromRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@authz.canAccessReservation(principal, #id)")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Consultar reserva por ID", description = "Obtiene los detalles completos de una reserva específica. Solo el cliente, el proveedor dueño o ADMIN pueden acceder.")
    public ResponseEntity<ReservationResponse> getReservationById(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.getReservationById(id));
    }

    @GetMapping("/code/{code}")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Consultar reserva por código", description = "Obtiene los datos de una reserva mediante su código alfanumérico único (ej. RES-2026-XXXX).")
    public ResponseEntity<ReservationResponse> getReservationByCode(@PathVariable String code) {
        ReservationResponse res = reservationService.getReservationByCode(code);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("@authz.isClientOwner(principal, #clientId)")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Reservas de un cliente", description = "Lista el historial de reservas de un cliente. Restringido al titular de la cuenta o ADMIN.")
    public ResponseEntity<List<ReservationResponse>> listByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(reservationService.listReservationsByClient(clientId));
    }

    @GetMapping("/provider/{providerId}")
    @PreAuthorize("@authz.isProviderOwner(principal, #providerId)")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Reservas de un proveedor", description = "Lista las reservas asociadas a las herramientas del proveedor especificado. Restringido a la empresa titular o ADMIN.")
    public ResponseEntity<List<ReservationResponse>> listByProvider(@PathVariable Long providerId) {
        return ResponseEntity.ok(reservationService.listReservationsByProvider(providerId));
    }

    @GetMapping("/tool/{toolId}/occupied-dates")
    @Operation(summary = "Fechas ocupadas de una herramienta", description = "Lista las reservas activas (APROBADA, EN_CURSO) de una herramienta para bloquearlas en el calendario visual.")
    public ResponseEntity<List<ReservationResponse>> getOccupiedDatesByTool(@PathVariable Long toolId) {
        return ResponseEntity.ok(reservationService.listReservationsByTool(toolId));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Listar todas las reservas", description = "Lista todas las reservas del sistema. Requiere privilegios de ADMIN.")
    public ResponseEntity<List<ReservationResponse>> listAll() {
        return ResponseEntity.ok(reservationService.listAllReservations());
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('PROVEEDOR', 'ADMIN') and @authz.canAccessReservation(principal, #id)")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Aprobar reserva", description = "Aprueba una reserva en estado PENDIENTE. Restringido al proveedor del equipo o ADMIN.")
    public ResponseEntity<ReservationResponse> approveReservation(@PathVariable Long id) {
        Reservation res = reservationService.approveReservation(id);
        return ResponseEntity.ok(reservationService.getReservationById(res.getId()));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("@authz.canAccessReservation(principal, #id)")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Cancelar reserva", description = "Cancela una reserva registrando el motivo. Restringido al cliente titular o ADMIN.")
    public ResponseEntity<ReservationResponse> cancelReservation(
            @PathVariable Long id,
            @RequestParam(defaultValue = "Cancelada por el usuario") String reason) {
        Reservation res = reservationService.cancelReservation(id, reason);
        return ResponseEntity.ok(reservationService.getReservationById(res.getId()));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('PROVEEDOR', 'ADMIN') and @authz.canAccessReservation(principal, #id)")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Rechazar reserva", description = "Rechaza una reserva registrando el motivo.")
    public ResponseEntity<ReservationResponse> rejectReservation(
            @PathVariable Long id,
            @RequestParam(defaultValue = "Rechazada por el proveedor") String reason) {
        Reservation res = reservationService.rejectReservation(id, reason);
        return ResponseEntity.ok(reservationService.getReservationById(res.getId()));
    }
}
