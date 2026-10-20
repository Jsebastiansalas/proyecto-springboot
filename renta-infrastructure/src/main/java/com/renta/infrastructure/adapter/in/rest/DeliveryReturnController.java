package com.renta.infrastructure.adapter.in.rest;

import com.renta.application.dto.delivery.DamageReportRequest;
import com.renta.application.dto.delivery.DamageReportResponse;
import com.renta.application.dto.delivery.DepositSettlementResponse;
import com.renta.application.dto.delivery.FinishRentalRequest;
import com.renta.application.dto.delivery.RentalDeliveryResponse;
import com.renta.application.dto.delivery.RentalReturnResponse;
import com.renta.application.dto.delivery.StartRentalRequest;
import com.renta.application.service.DeliveryReturnApplicationService;
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

import java.util.List;

/**
 * ============================================================================
 * ADAPTADOR PRIMARIO REST: CONTROLADOR DE LOGÍSTICA (ENTREGAS Y RECEPCIÓN)
 * ============================================================================
 * 
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Expone los endpoints HTTP para la operación logística en bodega y obra:
 * 1. `POST /api/v1/deliveries`: Acta de entrega de maquinaria (inicia alquiler EN_CURSO).
 * 2. `POST /api/v1/returns`: Acta de recepción y devolución técnica (FINALIZADA).
 * 3. `POST /api/v1/damages`: Reporte de averías o daños en obra.
 * 4. `GET /api/v1/logistics/settlement/{id}`: Liquidación final de depósitos de garantía.
 * 
 * ¿POR QUÉ ESTÁ CREADO Y DÓNDE ENCAJA EN LA ARQUITECTURA?
 * En la Arquitectura Hexagonal, adapta las solicitudes de despacho y retorno
 * de herramientas al servicio {@link DeliveryReturnApplicationService}.
 */
@RestController
@RequestMapping("/api/v1")
@Tag(name = "6. Entregas, Devoluciones e Inspección", description = "Control de despacho de maquinaria, acta de recepción, inspección física y reportes de avería")
public class DeliveryReturnController {

    private final DeliveryReturnApplicationService deliveryReturnService;

    public DeliveryReturnController(DeliveryReturnApplicationService deliveryReturnService) {
        this.deliveryReturnService = deliveryReturnService;
    }

    @PostMapping("/deliveries")
    @PreAuthorize("hasAnyRole('PROVEEDOR', 'ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Registrar entrega de equipo (Inicio de alquiler)", description = "Genera el acta de entrega con firma de conformidad y transiciona la reserva a EN_CURSO.")
    public ResponseEntity<RentalDeliveryResponse> startRental(@Valid @RequestBody StartRentalRequest request) {
        RentalDeliveryResponse response = deliveryReturnService.startRentalFromRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/returns")
    @PreAuthorize("hasAnyRole('PROVEEDOR', 'ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Registrar devolución de equipo (Fin de alquiler)", description = "Inspecciona el equipo, evalúa su estado, gestiona el reembolso del depósito y finaliza la reserva.")
    public ResponseEntity<RentalReturnResponse> finishRental(@Valid @RequestBody FinishRentalRequest request) {
        RentalReturnResponse response = deliveryReturnService.finishRentalFromRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/damages")
    @PreAuthorize("hasAnyRole('PROVEEDOR', 'ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Registrar reporte de daños o averías", description = "Documenta incidentes o daños en la herramienta con estimación económica de reparación.")
    public ResponseEntity<DamageReportResponse> registerDamage(@Valid @RequestBody DamageReportRequest request) {
        DamageReportResponse response = deliveryReturnService.registerDamageFromRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/damages/return/{returnId}")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Consultar reportes de daño de una devolución", description = "Lista los reportes de incidentes vinculados a una devolución específica.")
    public ResponseEntity<List<DamageReportResponse>> listDamageReports(@PathVariable Long returnId) {
        return ResponseEntity.ok(deliveryReturnService.listDamageReportsByReturnId(returnId));
    }

    @GetMapping("/logistics/settlement/{reservationId}")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Consultar liquidación del depósito de garantía", description = "Calcula y presenta el desglose financiero del reembolso de depósito tras devolución e inspección.")
    public ResponseEntity<DepositSettlementResponse> getDepositSettlement(@PathVariable Long reservationId) {
        return ResponseEntity.ok(deliveryReturnService.getSettlementResponse(reservationId));
    }
}
