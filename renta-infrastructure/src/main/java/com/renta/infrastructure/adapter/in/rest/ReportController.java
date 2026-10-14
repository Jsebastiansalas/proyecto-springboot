package com.renta.infrastructure.adapter.in.rest;

import com.renta.application.dto.report.AdminDashboardResponse;
import com.renta.application.dto.report.ProviderDashboardResponse;
import com.renta.application.service.ReportApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
@Tag(name = "7. Reportes y Dashboards Analíticos", description = "Métricas financieras, utilización de equipos y KPIs gerenciales para administradores y proveedores")
public class ReportController {

    private final ReportApplicationService reportService;

    public ReportController(ReportApplicationService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Dashboard gerencial global (Admin)", description = "Retorna métricas consolidadas: ingresos totales, depósitos retenidos, herramientas más alquiladas y evolución mensual.")
    public ResponseEntity<AdminDashboardResponse> getAdminDashboard() {
        return ResponseEntity.ok(reportService.getAdminDashboard());
    }

    @GetMapping("/provider/{providerId}")
    @PreAuthorize("hasAnyRole('PROVEEDOR', 'ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Dashboard de métricas del proveedor", description = "Retorna KPIs específicos del proveedor: ocupación de catálogo, ingresos generados y herramientas estrella.")
    public ResponseEntity<ProviderDashboardResponse> getProviderDashboard(@PathVariable Long providerId) {
        return ResponseEntity.ok(reportService.getProviderDashboard(providerId));
    }
}
