package com.renta.application.dto.invoice;

import com.renta.domain.model.enums.InvoiceStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record InvoiceResponse(
        Long id,
        String invoiceNumber,
        Long reservationId,
        String reservationCode,
        Long paymentId,
        String clientName,
        String clientDocument,
        String toolName,
        Instant issueDate,
        BigDecimal subtotal,
        BigDecimal taxAmount, // IVA 19%
        BigDecimal total,
        InvoiceStatus status,
        String pdfUrl
) {}
