package com.renta.domain.model.entity;

import com.renta.domain.model.enums.InvoiceStatus;
import com.renta.domain.model.vo.Money;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * ============================================================================
 * ENTIDAD DE DOMINIO: FACTURA FISCAL ELECTRÓNICA (Invoice)
 * ============================================================================
 * 
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Modela el documento contable y tributario oficial generado tras un pago:
 * 1. Almacena el número de factura legal consecutivo (ej. `FAC-2026-000001`).
 * 2. Guarda el desglose fiscal exacto con Value Objects {@link Money}:
 *    - `subtotal`: Valor neto antes de impuestos.
 *    - `taxAmount`: Importe retenido por IVA colombiano (19%).
 *    - `total`: Monto final pagado por el cliente.
 * 3. Enlaza de manera inmutable el identificador de la reserva y del pago.
 * 4. Almacena el enlace de acceso al archivo PDF oficial emitido.
 */
public class Invoice {
    private Long id;
    private String invoiceNumber;
    private Long reservationId;
    private Long paymentId;
    private Instant issueDate;
    private Money subtotal;
    private Money taxAmount;
    private Money total;
    private InvoiceStatus status = InvoiceStatus.EMITIDA;
    private String pdfUrl;

    public Invoice() {
    }

    public Invoice(Long id, String invoiceNumber, Long reservationId, Long paymentId,
                   Instant issueDate, Money subtotal, Money taxAmount, Money total,
                   InvoiceStatus status, String pdfUrl) {
        this.id = id;
        this.invoiceNumber = invoiceNumber;
        this.reservationId = reservationId;
        this.paymentId = paymentId;
        this.issueDate = issueDate != null ? issueDate : Instant.now();
        this.subtotal = subtotal;
        this.taxAmount = taxAmount;
        this.total = total != null ? total : (subtotal != null && taxAmount != null ? subtotal.plus(taxAmount) : null);
        this.status = status != null ? status : InvoiceStatus.EMITIDA;
        this.pdfUrl = pdfUrl;
    }

    public Invoice(Long id, String invoiceNumber, Long reservationId, Long paymentId,
                   Instant issueDate, BigDecimal subtotal, BigDecimal taxAmount, BigDecimal total,
                   InvoiceStatus status, String pdfUrl) {
        this(id, invoiceNumber, reservationId, paymentId, issueDate,
                subtotal != null ? Money.cop(subtotal) : null,
                taxAmount != null ? Money.cop(taxAmount) : null,
                total != null ? Money.cop(total) : null,
                status, pdfUrl);
    }

    public static Invoice create(String invoiceNumber, Long reservationId, Long paymentId,
                                  Money subtotal, Money taxAmount) {
        Objects.requireNonNull(subtotal, "El subtotal no puede ser nulo");
        Objects.requireNonNull(taxAmount, "El impuesto no puede ser nulo");
        Money total = subtotal.plus(taxAmount);
        return new Invoice(null, invoiceNumber, reservationId, paymentId, Instant.now(),
                subtotal, taxAmount, total, InvoiceStatus.EMITIDA, null);
    }

    public void annul() {
        this.status = InvoiceStatus.ANULADA;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public Long getReservationId() {
        return reservationId;
    }

    public void setReservationId(Long reservationId) {
        this.reservationId = reservationId;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public Instant getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(Instant issueDate) {
        this.issueDate = issueDate;
    }

    public Money getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Money subtotal) {
        this.subtotal = subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal != null ? Money.cop(subtotal) : null;
    }

    public Money getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(Money taxAmount) {
        this.taxAmount = taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount != null ? Money.cop(taxAmount) : null;
    }

    public Money getTotal() {
        return total;
    }

    public void setTotal(Money total) {
        this.total = total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total != null ? Money.cop(total) : null;
    }

    public InvoiceStatus getStatus() {
        return status;
    }

    public void setStatus(InvoiceStatus status) {
        this.status = status;
    }

    public String getPdfUrl() {
        return pdfUrl;
    }

    public void setPdfUrl(String pdfUrl) {
        this.pdfUrl = pdfUrl;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Invoice invoice)) return false;
        return Objects.equals(id, invoice.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Invoice{" + "id=" + id + ", number='" + invoiceNumber + '\'' + ", total=" + total + '}';
    }
}
