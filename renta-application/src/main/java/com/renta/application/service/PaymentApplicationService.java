package com.renta.application.service;

import com.renta.application.dto.payment.PaymentResponse;
import com.renta.application.dto.payment.ProcessPaymentRequest;
import com.renta.application.mapper.PaymentDtoMapper;
import com.renta.domain.exception.BusinessRuleViolationException;
import com.renta.domain.exception.ResourceNotFoundException;
import com.renta.domain.model.entity.Invoice;
import com.renta.domain.model.entity.Payment;
import com.renta.domain.model.entity.Reservation;
import com.renta.domain.model.enums.InvoiceStatus;
import com.renta.domain.model.enums.PaymentStatus;
import com.renta.domain.model.enums.ReservationStatus;
import com.renta.domain.model.vo.Money;
import com.renta.domain.port.in.ProcessPaymentUseCase;
import com.renta.domain.port.in.RegisterPaymentUseCase;
import com.renta.domain.port.out.InvoiceRepositoryPort;
import com.renta.domain.port.out.NotificationServicePort;
import com.renta.domain.port.out.PaymentGatewayPort;
import com.renta.domain.port.out.PaymentRepositoryPort;
import com.renta.domain.port.out.ReservationRepositoryPort;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

public class PaymentApplicationService implements ProcessPaymentUseCase, RegisterPaymentUseCase {

    private final PaymentRepositoryPort paymentRepository;
    private final ReservationRepositoryPort reservationRepository;
    private final InvoiceRepositoryPort invoiceRepository;
    private final PaymentGatewayPort paymentGateway;
    private final NotificationServicePort notificationService;

    public PaymentApplicationService(
            PaymentRepositoryPort paymentRepository,
            ReservationRepositoryPort reservationRepository,
            InvoiceRepositoryPort invoiceRepository,
            PaymentGatewayPort paymentGateway,
            NotificationServicePort notificationService) {
        this.paymentRepository = Objects.requireNonNull(paymentRepository);
        this.reservationRepository = Objects.requireNonNull(reservationRepository);
        this.invoiceRepository = Objects.requireNonNull(invoiceRepository);
        this.paymentGateway = Objects.requireNonNull(paymentGateway);
        this.notificationService = Objects.requireNonNull(notificationService);
    }

    @Override
    public Payment processPayment(ProcessPaymentCommand command) {
        Reservation reservation = reservationRepository.findById(command.reservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + command.reservationId()));

        if (paymentRepository.findByReservationId(reservation.getId()).isPresent()) {
            throw new BusinessRuleViolationException("La reserva #" + reservation.getReservationCode() + " ya tiene un pago registrado");
        }

        if (reservation.getStatus() == ReservationStatus.CANCELADA || reservation.getStatus() == ReservationStatus.RECHAZADA) {
            throw new BusinessRuleViolationException("No se puede pagar una reserva en estado: " + reservation.getStatus());
        }

        String txnRef = "TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        // Llamar a la pasarela de pagos
        PaymentGatewayPort.PaymentGatewayRequest gwReq = new PaymentGatewayPort.PaymentGatewayRequest(
                txnRef,
                command.amount(),
                command.method(),
                "cliente" + command.clientId() + "@correo.com"
        );
        PaymentGatewayPort.PaymentGatewayResult gwResult = paymentGateway.processPayment(gwReq);

        if (!gwResult.successful()) {
            throw new BusinessRuleViolationException("La pasarela de pagos rechazó la transacción: " + gwResult.message());
        }

        Payment payment = new Payment(
                null,
                txnRef,
                reservation.getId(),
                command.clientId(),
                command.method(),
                command.amount(),
                PaymentStatus.COMPLETADO,
                Instant.now(),
                gwResult.gatewayReference()
        );
        Payment savedPayment = paymentRepository.save(payment);

        // Si la reserva estaba pendiente, transicionar a APROBADA con el pago confirmado
        if (reservation.getStatus() == ReservationStatus.PENDIENTE) {
            reservation.transitionTo(ReservationStatus.APROBADA);
            reservation.setUpdatedAt(Instant.now());
            reservationRepository.save(reservation);
        }

        // Generar factura automática con IVA 19%
        String invoiceNum = "FAC-" + LocalDate.now().getYear() + "-" + String.format("%06d", savedPayment.getId());
        BigDecimal subtotalVal = reservation.getSubtotal().amount();
        BigDecimal taxVal = subtotalVal.multiply(new BigDecimal("0.19")).setScale(2, java.math.RoundingMode.HALF_UP);
        Money subtotalMoney = Money.cop(subtotalVal);
        Money taxMoney = Money.cop(taxVal);
        Money totalMoney = subtotalMoney.plus(taxMoney);

        Invoice invoice = new Invoice(
                null,
                invoiceNum,
                reservation.getId(),
                savedPayment.getId(),
                Instant.now(),
                subtotalMoney,
                taxMoney,
                totalMoney,
                InvoiceStatus.EMITIDA,
                "/api/v1/invoices/" + savedPayment.getId() + "/pdf"
        );
        invoiceRepository.save(invoice);

        notificationService.notifyPaymentReceived(savedPayment);
        return savedPayment;
    }

    public PaymentResponse processFromRequest(ProcessPaymentRequest req) {
        ProcessPaymentCommand cmd = new ProcessPaymentCommand(
                req.reservationId(),
                req.clientId(),
                req.paymentMethod(),
                Money.cop(req.amount()),
                req.gatewayReference()
        );
        Payment payment = processPayment(cmd);
        String resCode = reservationRepository.findById(payment.getReservationId())
                .map(Reservation::getReservationCode)
                .orElse("RES-" + payment.getReservationId());
        return PaymentDtoMapper.toResponse(payment, resCode);
    }

    public PaymentResponse getPaymentByReservationId(Long reservationId) {
        Payment p = paymentRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró pago para la reserva ID: " + reservationId));
        String resCode = reservationRepository.findById(p.getReservationId())
                .map(Reservation::getReservationCode)
                .orElse("RES-" + p.getReservationId());
        return PaymentDtoMapper.toResponse(p, resCode);
    }
}
