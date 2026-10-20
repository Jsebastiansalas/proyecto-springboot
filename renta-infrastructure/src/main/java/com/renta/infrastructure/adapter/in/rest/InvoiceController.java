package com.renta.infrastructure.adapter.in.rest;

import com.renta.application.dto.invoice.InvoiceResponse;
import com.renta.application.service.InvoiceApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;

/**
 * ============================================================================
 * ADAPTADOR PRIMARIO REST: CONTROLADOR DE FACTURACIÓN ELECTRÓNICA
 * ============================================================================
 * 
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Expone los endpoints HTTP bajo `/api/v1/invoices`:
 * 1. `GET /api/v1/invoices/{id}`: Consulta de factura por su ID interno.
 * 2. `GET /api/v1/invoices/reservation/{id}`: Consulta de factura por ID de reserva.
 * 3. `GET /api/v1/invoices/{id}/pdf`: Descarga o previsualización del comprobante en PDF.
 * 
 * ¿POR QUÉ ESTÁ CREADO Y DÓNDE ENCAJA EN LA ARQUITECTURA?
 * En la Arquitectura Hexagonal, adapta las solicitudes de consulta y descarga
 * de documentos tributarios al servicio {@link InvoiceApplicationService},
 * validando que el cliente autenticado sea el titular legal de la factura.
 */
@RestController
@RequestMapping("/api/v1/invoices")
@Tag(name = "5. Facturación Electrónica", description = "Consulta y descarga de comprobantes fiscales generados con desglose de IVA (19%)")
public class InvoiceController {

    private final InvoiceApplicationService invoiceService;

    public InvoiceController(InvoiceApplicationService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping("/{id}")
    @PreAuthorize("@authz.canAccessInvoice(principal, #id)")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Consultar factura por ID", description = "Obtiene los datos fiscales de una factura por su ID interno. Restringido al titular o ADMIN.")
    public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    @GetMapping("/reservation/{reservationId}")
    @PreAuthorize("@authz.canAccessReservation(principal, #reservationId)")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Consultar factura por reserva", description = "Obtiene la factura asociada a una reserva específica. Restringido a las partes involucradas o ADMIN.")
    public ResponseEntity<InvoiceResponse> getInvoiceByReservationId(@PathVariable Long reservationId) {
        return ResponseEntity.ok(invoiceService.getInvoiceByReservationId(reservationId));
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("@authz.canAccessInvoice(principal, #id)")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Descarga de factura digital", description = "Genera y descarga el comprobante oficial de la factura en formato digital. Restringido al titular o ADMIN.")
    public ResponseEntity<byte[]> downloadInvoicePdf(@PathVariable Long id) {
        InvoiceResponse invoice = invoiceService.getInvoiceById(id);

        String simulatedPdfContent = """
                ========================================================================
                          PLATAFORMA DE RENTA DE HERRAMIENTAS Y EQUIPOS S.A.S.
                                          NIT: 901.884.231-9
                                      FACTURA ELECTRÓNICA DE VENTA
                ========================================================================
                Número de Factura : %s
                Fecha de Emisión  : %s
                Código de Reserva : %s
                ------------------------------------------------------------------------
                DATOS DEL CLIENTE:
                Nombre / Razón    : %s
                Identificación    : %s
                ------------------------------------------------------------------------
                CONCEPTO DEL ALQUILER:
                Herramienta       : %s
                Estado Factura    : %s
                ------------------------------------------------------------------------
                Subtotal          : $ %,.2f COP
                IVA (19%%)         : $ %,.2f COP
                TOTAL A PAGAR     : $ %,.2f COP
                ========================================================================
                      Gracias por confiar en nuestra maquinaria de construcción.
                ========================================================================
                """.formatted(
                invoice.invoiceNumber(),
                invoice.issueDate(),
                invoice.reservationCode(),
                invoice.clientName(),
                invoice.clientDocument(),
                invoice.toolName(),
                invoice.status(),
                invoice.subtotal(),
                invoice.taxAmount(),
                invoice.total()
        );

        byte[] contentBytes = simulatedPdfContent.getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + invoice.invoiceNumber() + ".txt\"")
                .contentType(MediaType.TEXT_PLAIN)
                .body(contentBytes);
    }
}
