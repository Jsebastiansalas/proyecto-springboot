package com.renta.infrastructure.adapter.in.rest;

import com.renta.application.dto.maintenance.FinishMaintenanceRequest;
import com.renta.application.dto.maintenance.ScheduleMaintenanceRequest;
import com.renta.application.dto.maintenance.ToolMaintenanceResponse;
import com.renta.application.service.ToolMaintenanceApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tools/maintenance")
@Tag(name = "10. Mantenimiento y Hoja de Vida", description = "Control técnico, preventivo y calibración de maquinaria con bloqueo automático de catálogo")
public class ToolMaintenanceController {

    private final ToolMaintenanceApplicationService maintenanceService;

    public ToolMaintenanceController(ToolMaintenanceApplicationService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PROVEEDOR', 'ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Programar mantenimiento de equipo", description = "Registra una orden de mantenimiento técnico y cambia el estado de la herramienta a MANTENIMIENTO, bloqueando su alquiler.")
    public ResponseEntity<ToolMaintenanceResponse> scheduleMaintenance(
            @Valid @RequestBody ScheduleMaintenanceRequest request) {
        ToolMaintenanceResponse response = maintenanceService.scheduleMaintenance(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{maintenanceId:[0-9]+}/finish")
    @PreAuthorize("hasAnyRole('PROVEEDOR', 'ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Finalizar mantenimiento y rehabilitar equipo", description = "Registra los costos finales y notas técnicas, y reincorpora automáticamente la herramienta al estado DISPONIBLE.")
    public ResponseEntity<ToolMaintenanceResponse> finishMaintenance(
            @PathVariable Long maintenanceId,
            @Valid @RequestBody FinishMaintenanceRequest request) {
        return ResponseEntity.ok(maintenanceService.finishMaintenance(maintenanceId, request));
    }

    @GetMapping("/tool/{toolId:[0-9]+}")
    @Operation(summary = "Historial técnico de una herramienta", description = "Lista todas las intervenciones de mantenimiento, calibración y reparaciones realizadas sobre la herramienta.")
    public ResponseEntity<List<ToolMaintenanceResponse>> listByTool(@PathVariable Long toolId) {
        return ResponseEntity.ok(maintenanceService.listByToolId(toolId));
    }

    @GetMapping("/active")
    @Operation(summary = "Listar todos los mantenimientos activos", description = "Lista todas las órdenes técnicas actualmente en proceso en taller.")
    public ResponseEntity<List<ToolMaintenanceResponse>> listAllActive() {
        return ResponseEntity.ok(maintenanceService.listAllActive());
    }

    @GetMapping("/provider/{providerId:[0-9]+}")
    @PreAuthorize("hasAnyRole('PROVEEDOR', 'ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Listar mantenimientos de un proveedor", description = "Lista las órdenes de taller de las herramientas que pertenecen a un proveedor específico.")
    public ResponseEntity<List<ToolMaintenanceResponse>> listByProvider(@PathVariable Long providerId) {
        return ResponseEntity.ok(maintenanceService.listByProviderId(providerId));
    }
}
