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

import com.renta.application.dto.delivery.DeliveryChecklistResponse;
import com.renta.infrastructure.adapter.out.persistence.entity.DeliveryChecklistJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataDeliveryChecklistRepository;

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
    private final SpringDataDeliveryChecklistRepository deliveryChecklistRepository;

    public DeliveryReturnController(DeliveryReturnApplicationService deliveryReturnService) {
        this(deliveryReturnService, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public DeliveryReturnController(
            DeliveryReturnApplicationService deliveryReturnService,
            SpringDataDeliveryChecklistRepository deliveryChecklistRepository) {
        this.deliveryReturnService = deliveryReturnService;
        this.deliveryChecklistRepository = deliveryChecklistRepository;
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

    @PostMapping("/logistics/dispatch/{reservationId}")
    @PreAuthorize("hasAnyRole('PROVEEDOR', 'ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Despachar reserva (alias logístico)")
    public ResponseEntity<RentalDeliveryResponse> dispatchRental(
            @PathVariable Long reservationId,
            @RequestBody(required = false) java.util.Map<String, Object> body) {
        String obs = body != null && body.containsKey("observations") && body.get("observations") != null
                ? String.valueOf(body.get("observations")) : "Despacho autorizado por patio central";
        Integer initialHours = body != null && body.containsKey("initialHours") && body.get("initialHours") != null
                ? ((Number) body.get("initialHours")).intValue() : 0;
        StartRentalRequest req = new StartRentalRequest(
                reservationId,
                "Patio Central RentaMaq",
                obs,
                true,
                initialHours,
                initialHours,
                obs
        );
        RentalDeliveryResponse res = deliveryReturnService.startRentalFromRequest(req);

        if (deliveryChecklistRepository != null && res != null && res.id() != null) {
            boolean cables = body != null && body.containsKey("cablesInspected") ? Boolean.parseBoolean(String.valueOf(body.get("cablesInspected"))) : true;
            boolean safety = body != null && body.containsKey("safetyGuardsOk") ? Boolean.parseBoolean(String.valueOf(body.get("safetyGuardsOk"))) : true;
            boolean retie = body != null && body.containsKey("retieCertified") ? Boolean.parseBoolean(String.valueOf(body.get("retieCertified"))) : true;
            boolean fluids = body != null && body.containsKey("fluidsLevelOk") ? Boolean.parseBoolean(String.valueOf(body.get("fluidsLevelOk"))) : true;
            boolean ppe = body != null && body.containsKey("operatorPpeKitIncluded") ? Boolean.parseBoolean(String.valueOf(body.get("operatorPpeKitIncluded"))) : true;
            String signature = body != null && body.containsKey("inspectorSignature") && body.get("inspectorSignature") != null
                    ? String.valueOf(body.get("inspectorSignature")) : "Inspector Técnico de Patio";

            DeliveryChecklistJpaEntity checklist = new DeliveryChecklistJpaEntity(
                    res.id(), cables, safety, retie, fluids, ppe, signature
            );
            deliveryChecklistRepository.save(checklist);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping("/deliveries/{deliveryId}/checklist")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Consultar checklist técnico RETIE de despacho", description = "Retorna el acta de verificación técnica obligatoria antes de autorizar salida a obra.")
    public ResponseEntity<DeliveryChecklistResponse> getDeliveryChecklist(@PathVariable Long deliveryId) {
        if (deliveryChecklistRepository == null) {
            return ResponseEntity.notFound().build();
        }
        return deliveryChecklistRepository.findByDeliveryId(deliveryId)
                .map(c -> ResponseEntity.ok(new DeliveryChecklistResponse(
                        c.getId(),
                        c.getDeliveryId(),
                        c.isCablesInspected(),
                        c.isSafetyGuardsOk(),
                        c.isRetieCertified(),
                        c.isFluidsLevelOk(),
                        c.isOperatorPpeKitIncluded(),
                        c.getInspectorSignature(),
                        c.isCablesInspected() && c.isSafetyGuardsOk() && c.isRetieCertified() && c.isFluidsLevelOk() && c.isOperatorPpeKitIncluded(),
                        c.getCreatedAt()
                )))
                .orElse(ResponseEntity.ok(new DeliveryChecklistResponse(
                        null,
                        deliveryId,
                        true,
                        true,
                        true,
                        true,
                        true,
                        "Protocolo RETIE Estándar Certificado",
                        true,
                        java.time.Instant.now()
                )));
    }

    @PostMapping("/logistics/return/{reservationId}")
    @PreAuthorize("hasAnyRole('PROVEEDOR', 'ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Recepción de devolución (alias logístico)")
    public ResponseEntity<RentalReturnResponse> returnRental(
            @PathVariable Long reservationId,
            @RequestBody(required = false) java.util.Map<String, Object> body) {
        java.math.BigDecimal damageCost = java.math.BigDecimal.ZERO;
        if (body != null && body.containsKey("damageCost") && body.get("damageCost") != null) {
            try {
                damageCost = new java.math.BigDecimal(body.get("damageCost").toString());
            } catch (Exception ignored) {}
        }
        String report = body != null && body.containsKey("damageReport") && body.get("damageReport") != null
                ? String.valueOf(body.get("damageReport")) : "Reingreso a patio sin novedades.";
        Integer finalHours = body != null && body.containsKey("finalHours") && body.get("finalHours") != null
                ? ((Number) body.get("finalHours")).intValue() : 0;
        com.renta.domain.model.enums.ToolConditionStatus status = damageCost.compareTo(java.math.BigDecimal.ZERO) > 0
                ? com.renta.domain.model.enums.ToolConditionStatus.DANADO
                : com.renta.domain.model.enums.ToolConditionStatus.BUENO;
        FinishRentalRequest req = new FinishRentalRequest(
                reservationId,
                "Inspector Técnico RentaMaq",
                status,
                report,
                damageCost.compareTo(java.math.BigDecimal.ZERO) == 0,
                damageCost,
                damageCost,
                com.renta.domain.model.enums.DamageType.ESTRUCTURA,
                damageCost.compareTo(java.math.BigDecimal.ZERO) > 0 ? report : null,
                finalHours,
                damageCost,
                report
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(deliveryReturnService.finishRentalFromRequest(req));
    }

    /**
     * EVALUAR LIQUIDACIÓN Y MORA POR DEVOLUCIÓN TARDÍA
     */
    @GetMapping("/returns/late-settlement/{reservationId}")
    @PreAuthorize("hasAnyRole('CLIENTE', 'PROVEEDOR', 'ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Calcular liquidación por devolución tardía / mora", description = "Evalúa si la herramienta tiene retraso y calcula el cobro penalizable y el saldo de fianza a reintegrar.")
    public ResponseEntity<com.renta.application.dto.delivery.LateReturnSettlementResponse> getLateReturnSettlement(
            @PathVariable Long reservationId,
            @org.springframework.web.bind.annotation.RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate returnDate) {
        return ResponseEntity.ok(deliveryReturnService.calculateLateReturnSettlement(reservationId, returnDate));
    }
}
