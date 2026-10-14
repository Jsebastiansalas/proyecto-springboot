package com.renta.application.service;

import com.renta.application.dto.invoice.InvoiceResponse;
import com.renta.application.mapper.InvoiceDtoMapper;
import com.renta.domain.exception.ResourceNotFoundException;
import com.renta.domain.model.entity.Client;
import com.renta.domain.model.entity.Invoice;
import com.renta.domain.model.entity.Payment;
import com.renta.domain.model.entity.Reservation;
import com.renta.domain.model.entity.Tool;
import com.renta.domain.model.enums.InvoiceStatus;
import com.renta.domain.model.vo.Money;
import com.renta.domain.port.in.EmitInvoiceUseCase;
import com.renta.domain.port.in.GenerateInvoiceUseCase;
import com.renta.domain.port.out.ClientRepositoryPort;
import com.renta.domain.port.out.InvoiceRepositoryPort;
import com.renta.domain.port.out.PaymentRepositoryPort;
import com.renta.domain.port.out.ReservationRepositoryPort;
import com.renta.domain.port.out.ToolRepositoryPort;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;

public class InvoiceApplicationService implements GenerateInvoiceUseCase, EmitInvoiceUseCase {

    private final InvoiceRepositoryPort invoiceRepository;
    private final ReservationRepositoryPort reservationRepository;
    private final PaymentRepositoryPort paymentRepository;
    private final ClientRepositoryPort clientRepository;
    private final ToolRepositoryPort toolRepository;

    public InvoiceApplicationService(
            InvoiceRepositoryPort invoiceRepository,
            ReservationRepositoryPort reservationRepository,
            PaymentRepositoryPort paymentRepository,
            ClientRepositoryPort clientRepository,
            ToolRepositoryPort toolRepository) {
        this.invoiceRepository = Objects.requireNonNull(invoiceRepository);
        this.reservationRepository = Objects.requireNonNull(reservationRepository);
        this.paymentRepository = Objects.requireNonNull(paymentRepository);
        this.clientRepository = Objects.requireNonNull(clientRepository);
        this.toolRepository = Objects.requireNonNull(toolRepository);
    }

    @Override
    public Invoice generateInvoice(Long reservationId, Long paymentId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + reservationId));
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado con ID: " + paymentId));

        return invoiceRepository.findByReservationId(reservationId)
                .orElseGet(() -> {
                    String num = "FAC-" + LocalDate.now().getYear() + "-" + String.format("%06d", payment.getId());
                    BigDecimal subtotalVal = reservation.getSubtotal().amount();
                    BigDecimal taxVal = subtotalVal.multiply(new BigDecimal("0.19")).setScale(2, java.math.RoundingMode.HALF_UP);
                    Money subtotalMoney = Money.cop(subtotalVal);
                    Money taxMoney = Money.cop(taxVal);
                    Money totalMoney = subtotalMoney.plus(taxMoney);

                    Invoice inv = new Invoice(
                            null,
                            num,
                            reservationId,
                            paymentId,
                            Instant.now(),
                            subtotalMoney,
                            taxMoney,
                            totalMoney,
                            InvoiceStatus.EMITIDA,
                            "/api/v1/invoices/" + paymentId + "/pdf"
                    );
                    return invoiceRepository.save(inv);
                });
    }

    public InvoiceResponse getInvoiceByReservationId(Long reservationId) {
        Invoice inv = invoiceRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Factura no encontrada para la reserva ID: " + reservationId));
        return enrichInvoice(inv);
    }

    public InvoiceResponse getInvoiceById(Long id) {
        Invoice inv = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Factura no encontrada con ID: " + id));
        return enrichInvoice(inv);
    }

    private InvoiceResponse enrichInvoice(Invoice inv) {
        Reservation res = reservationRepository.findById(inv.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + inv.getReservationId()));

        String clientName = clientRepository.findById(res.getClientId())
                .map(Client::getFullName)
                .orElse("Cliente #" + res.getClientId());
        String clientDoc = clientRepository.findById(res.getClientId())
                .map(Client::getDocumentNumber)
                .orElse("N/A");
        String toolName = toolRepository.findById(res.getToolId())
                .map(Tool::getName)
                .orElse("Herramienta #" + res.getToolId());

        return InvoiceDtoMapper.toResponse(inv, res.getReservationCode(), clientName, clientDoc, toolName);
    }
}
