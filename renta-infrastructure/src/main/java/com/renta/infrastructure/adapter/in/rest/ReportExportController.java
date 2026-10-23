package com.renta.infrastructure.adapter.in.rest;

import com.renta.application.service.export.CsvReportExporter;
import com.renta.domain.model.entity.Reservation;
import com.renta.domain.model.entity.Tool;
import com.renta.domain.port.out.ReservationRepositoryPort;
import com.renta.domain.port.out.ToolRepositoryPort;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reports/export")
@Tag(name = "7. Reportes y Dashboards Analíticos", description = "Descarga de reportes operativos en formato plano CSV / Excel")
public class ReportExportController {

    private final ReservationRepositoryPort reservationRepository;
    private final ToolRepositoryPort toolRepository;

    public ReportExportController(
            ReservationRepositoryPort reservationRepository,
            ToolRepositoryPort toolRepository) {
        this.reservationRepository = reservationRepository;
        this.toolRepository = toolRepository;
    }

    @GetMapping("/reservations/csv")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROVEEDOR')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Descargar reporte de reservas en CSV / Excel", description = "Exporta el historial de alquileres con desglose financiero, estados y fechas en un archivo .csv descargable.")
    public ResponseEntity<byte[]> exportReservationsCsv() {
        List<Reservation> reservations = reservationRepository.findAll();
        byte[] csvData = CsvReportExporter.exportReservationsToCsv(reservations);

        String filename = "reservas_rentamaq_" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
                .body(csvData);
    }

    @GetMapping("/tools/csv")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROVEEDOR')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Descargar inventario de herramientas en CSV / Excel", description = "Exporta el catálogo de maquinaria con tarifas y depósitos.")
    public ResponseEntity<byte[]> exportToolsCsv() {
        List<Tool> tools = toolRepository.findAll();
        byte[] csvData = CsvReportExporter.exportToolsToCsv(tools);

        String filename = "inventario_herramientas_" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
                .body(csvData);
    }
}
