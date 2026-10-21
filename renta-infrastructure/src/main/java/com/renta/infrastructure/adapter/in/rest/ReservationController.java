package com.renta.infrastructure.adapter.in.rest;

import com.renta.application.dto.reservation.CalculatePriceRequest;
import com.renta.application.dto.reservation.CreateReservationRequest;
import com.renta.application.dto.reservation.PriceCalculationResponse;
import com.renta.application.dto.reservation.ReservationResponse;
import com.renta.application.service.ReservationApplicationService;
import com.renta.domain.model.entity.Reservation;
import com.renta.domain.port.out.ClientRepositoryPort;
import com.renta.domain.port.out.ProviderRepositoryPort;
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

/**
 * ============================================================================
 * ADAPTADOR PRIMARIO REST: CONTROLADOR DE RESERVAS Y COTIZADOR
 * ============================================================================
 * 
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Expone los endpoints HTTP bajo `/api/v1/reservations`:
 * 1. `POST /api/v1/reservations/calculate-price`: Cotizador dinámico público (aplica -15% y 19% IVA).
 * 2. `POST /api/v1/reservations`: Creación de reservas con validación de no-solapamiento de fechas.
 * 3. `GET /api/v1/reservations/tool/{id}/occupied-dates`: Consulta de calendario para bloquear días.
 * 4. `GET /api/v1/reservations/my`: Listado de reservas del cliente autenticado.
 * 5. `GET /api/v1/reservations/provider`: Bandeja de solicitudes para el proveedor.
 * 6. `PATCH /api/v1/reservations/{id}/approve` y `reject`: Aprobación/rechazo de contratos.
 * 
 * ¿POR QUÉ ESTÁ CREADO Y DÓNDE ENCAJA EN LA ARQUITECTURA?
 * En la Arquitectura Hexagonal, es el Adaptador de Entrada que recibe DTOs
 * inmutables (`CreateReservationRequest`), delega la orquestación a
 * {@link ReservationApplicationService} y responde con códigos HTTP estándar (200, 201, 409).
 */
@RestController
@RequestMapping("/api/v1/reservations")
@Tag(name = "3. Reservas y Alquileres", description = "Endpoints para cotización dinámica, creación y ciclo de vida de reservas")
public class ReservationController {

    private final ReservationApplicationService reservationService;
    private final ClientRepositoryPort clientRepository;
    private final ProviderRepositoryPort providerRepository;

    public ReservationController(
            ReservationApplicationService reservationService,
            ClientRepositoryPort clientRepository,
            ProviderRepositoryPort providerRepository) {
        this.reservationService = reservationService;
        this.clientRepository = clientRepository;
        this.providerRepository = providerRepository;
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
    public ResponseEntity<ReservationResponse> createReservation(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateReservationRequest request) {

        Long effectiveClientId = request.clientId();
        if (effectiveClientId == null && userDetails != null) {
            effectiveClientId = clientRepository.findByUserId(userDetails.getId())
                    .map(com.renta.domain.model.entity.Client::getId)
                    .orElse(null);
        }

        // Si es un cliente demo o admin sin perfil directo, fallback seguro al cliente 1
        if (effectiveClientId == null) {
            effectiveClientId = 1L;
        }

        CreateReservationRequest resolvedRequest = new CreateReservationRequest(
                effectiveClientId,
                request.toolId(),
                request.startDate(),
                request.endDate(),
                request.notes()
        );

        ReservationResponse response = reservationService.createFromRequest(resolvedRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('CLIENTE', 'ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Reservas del cliente autenticado", description = "Lista el historial de reservas de la cuenta del cliente actualmente autenticado.")
    public ResponseEntity<List<ReservationResponse>> getMyReservations(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return clientRepository.findByUserId(userDetails.getId())
                .map(client -> ResponseEntity.ok(reservationService.listReservationsByClient(client.getId())))
                .orElse(ResponseEntity.ok(List.of()));
    }

    @GetMapping("/provider")
    @PreAuthorize("hasAnyRole('PROVEEDOR', 'ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Reservas del proveedor autenticado", description = "Lista las reservas de las herramientas asociadas a la empresa proveedora actualmente autenticada.")
    public ResponseEntity<List<ReservationResponse>> getMyProviderReservations(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return providerRepository.findByUserId(userDetails.getId())
                .map(provider -> ResponseEntity.ok(reservationService.listReservationsByProvider(provider.getId())))
                .orElse(ResponseEntity.ok(List.of()));
    }

    @GetMapping("/{id:[0-9]+}")
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

    @GetMapping("/client/{clientId:[0-9]+}")
    @PreAuthorize("@authz.isClientOwner(principal, #clientId)")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Reservas de un cliente", description = "Lista el historial de reservas de un cliente. Restringido al titular de la cuenta o ADMIN.")
    public ResponseEntity<List<ReservationResponse>> listByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(reservationService.listReservationsByClient(clientId));
    }

    @GetMapping("/provider/{providerId:[0-9]+}")
    @PreAuthorize("@authz.isProviderOwner(principal, #providerId)")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Reservas de un proveedor", description = "Lista las reservas asociadas a las herramientas del proveedor especificado. Restringido a la empresa titular o ADMIN.")
    public ResponseEntity<List<ReservationResponse>> listByProvider(@PathVariable Long providerId) {
        return ResponseEntity.ok(reservationService.listReservationsByProvider(providerId));
    }

    @GetMapping("/tool/{toolId:[0-9]+}/occupied-dates")
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

    @PatchMapping("/{id:[0-9]+}/approve")
    @PreAuthorize("hasAnyRole('PROVEEDOR', 'ADMIN') and @authz.canAccessReservation(principal, #id)")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Aprobar reserva", description = "Aprueba una reserva en estado PENDIENTE. Restringido al proveedor del equipo o ADMIN.")
    public ResponseEntity<ReservationResponse> approveReservation(@PathVariable Long id) {
        Reservation res = reservationService.approveReservation(id);
        return ResponseEntity.ok(reservationService.getReservationById(res.getId()));
    }

    @PatchMapping("/{id:[0-9]+}/cancel")
    @PreAuthorize("@authz.canAccessReservation(principal, #id)")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Cancelar reserva", description = "Cancela una reserva registrando el motivo. Restringido al cliente titular o ADMIN.")
    public ResponseEntity<ReservationResponse> cancelReservation(
            @PathVariable Long id,
            @RequestParam(defaultValue = "Cancelada por el usuario") String reason) {
        Reservation res = reservationService.cancelReservation(id, reason);
        return ResponseEntity.ok(reservationService.getReservationById(res.getId()));
    }

    @PatchMapping("/{id:[0-9]+}/reject")
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
