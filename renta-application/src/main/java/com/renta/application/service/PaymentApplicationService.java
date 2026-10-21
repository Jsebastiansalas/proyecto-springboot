package com.renta.application.service;

import com.renta.application.dto.payment.InstallmentPlanSummaryResponse;
import com.renta.application.dto.payment.PaymentInstallmentResponse;
import com.renta.application.dto.payment.PaymentResponse;
import com.renta.application.dto.payment.ProcessPaymentRequest;
import com.renta.application.mapper.PaymentDtoMapper;
import com.renta.domain.exception.BusinessRuleViolationException;
import com.renta.domain.exception.ResourceNotFoundException;
import com.renta.domain.model.entity.Invoice;
import com.renta.domain.model.entity.Payment;
import com.renta.domain.model.entity.PaymentInstallment;
import com.renta.domain.model.entity.Reservation;
import com.renta.domain.model.enums.InvoiceStatus;
import com.renta.domain.model.enums.PaymentInstallmentStatus;
import com.renta.domain.model.enums.PaymentStatus;
import com.renta.domain.model.enums.ReservationStatus;
import com.renta.domain.model.vo.Money;
import com.renta.domain.port.in.ProcessPaymentUseCase;
import com.renta.domain.port.in.RegisterPaymentUseCase;
import com.renta.domain.port.out.InvoiceRepositoryPort;
import com.renta.domain.port.out.NotificationServicePort;
import com.renta.domain.port.out.PaymentGatewayPort;
import com.renta.domain.port.out.PaymentInstallmentRepositoryPort;
import com.renta.domain.port.out.PaymentRepositoryPort;
import com.renta.domain.port.out.ReservationRepositoryPort;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * ============================================================================
 * SERVICIO DE APLICACIÓN: PROCESAMIENTO DE PAGOS Y CUOTAS FINANCIERAS
 * ============================================================================
 * 
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Es el motor transaccional de pagos de la plataforma. Se encarga de:
 * 1. Procesar pagos de alquileres (tarjeta de crédito, PSE, transferencia)
 *    validando montos exactos y generando referencias únicas de auditoría (TXN-...).
 * 2. Transicionar el estado de la reserva de APROBADA a PAGADA.
 * 3. Disparar automáticamente la emisión de la factura electrónica DIAN y la
 *    notificación por correo al cliente.
 * 4. Gestionar planes de pago diferido por cuotas (PaymentInstallments) con
 *    cálculo de fechas de vencimiento y amortización de saldos.
 * 
 * ¿POR QUÉ ESTÁ CREADO Y DÓNDE ENCAJA EN LA ARQUITECTURA?
 * En la Arquitectura Hexagonal, orquesta los casos de uso {@link ProcessPaymentUseCase}
 * y {@link RegisterPaymentUseCase}. Se comunica con la pasarela a través del
 * Puerto de Salida {@link PaymentGatewayPort} y con la persistencia mediante
 * {@link PaymentRepositoryPort} y {@link ReservationRepositoryPort}, manteniendo
 * el aislamiento transaccional y la integridad contable.
 */
public class PaymentApplicationService implements ProcessPaymentUseCase, RegisterPaymentUseCase {

    private final PaymentRepositoryPort paymentRepository;
    private final ReservationRepositoryPort reservationRepository;
    private final InvoiceRepositoryPort invoiceRepository;
    private final PaymentGatewayPort paymentGateway;
    private final NotificationServicePort notificationService;
    private final PaymentInstallmentRepositoryPort installmentRepository;

    public PaymentApplicationService(
            PaymentRepositoryPort paymentRepository,
            ReservationRepositoryPort reservationRepository,
            InvoiceRepositoryPort invoiceRepository,
            PaymentGatewayPort paymentGateway,
            NotificationServicePort notificationService) {
        this(paymentRepository, reservationRepository, invoiceRepository, paymentGateway, notificationService, null);
    }

    public PaymentApplicationService(
            PaymentRepositoryPort paymentRepository,
            ReservationRepositoryPort reservationRepository,
            InvoiceRepositoryPort invoiceRepository,
            PaymentGatewayPort paymentGateway,
            NotificationServicePort notificationService,
            PaymentInstallmentRepositoryPort installmentRepository) {
        this.paymentRepository = Objects.requireNonNull(paymentRepository);
        this.reservationRepository = Objects.requireNonNull(reservationRepository);
        this.invoiceRepository = Objects.requireNonNull(invoiceRepository);
        this.paymentGateway = Objects.requireNonNull(paymentGateway);
        this.notificationService = Objects.requireNonNull(notificationService);
        this.installmentRepository = installmentRepository;
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

        int count = (command.installmentCount() != null && command.installmentCount() > 0) ? command.installmentCount() : 1;
        if (count != 1 && count != 2 && count != 3 && count != 6 && count != 12) {
            throw new BusinessRuleViolationException("El plan de cuotas debe ser de 1, 2, 3, 6 o 12 meses.");
        }

        BigDecimal interestRate = BigDecimal.ZERO;
        if (count == 6 || count == 12) {
            interestRate = new BigDecimal("1.80");
        }

        String txnRef = "TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        // Llamar a la pasarela de pagos para la cuota inicial / monto total
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

        PaymentStatus initialStatus = (count > 1) ? PaymentStatus.EN_CUOTAS : PaymentStatus.COMPLETADO;
        Payment payment = new Payment(
                null,
                txnRef,
                reservation.getId(),
                command.clientId(),
                command.method(),
                command.amount(),
                initialStatus,
                Instant.now(),
                gwResult.gatewayReference(),
                count,
                1,
                interestRate
        );
        Payment savedPayment = paymentRepository.save(payment);

        // Generar cronograma de cuotas (4FN)
        if (installmentRepository != null) {
            List<PaymentInstallment> installments = new ArrayList<>();
            BigDecimal totalAmount = command.amount().amount();
            BigDecimal baseInstallment = totalAmount.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
            BigDecimal interestPerInstallment = BigDecimal.ZERO;
            if (interestRate.compareTo(BigDecimal.ZERO) > 0) {
                interestPerInstallment = baseInstallment.multiply(interestRate.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)).setScale(2, RoundingMode.HALF_UP);
            }
            BigDecimal totalInstallmentVal = baseInstallment.add(interestPerInstallment);

            LocalDate today = LocalDate.now();
            for (int i = 1; i <= count; i++) {
                PaymentInstallmentStatus st = (i == 1) ? PaymentInstallmentStatus.PAGADA : PaymentInstallmentStatus.PENDIENTE;
                Instant paidTime = (i == 1) ? Instant.now() : null;
                String instTxn = (i == 1) ? (txnRef + "-C1") : null;
                LocalDate due = today.plusDays(30L * (i - 1));

                installments.add(new PaymentInstallment(
                        null,
                        savedPayment.getId(),
                        reservation.getId(),
                        i,
                        count,
                        due,
                        baseInstallment,
                        interestPerInstallment,
                        totalInstallmentVal,
                        st,
                        paidTime,
                        instTxn
                ));
            }
            installmentRepository.saveAll(installments);
        }

        // Si la reserva estaba pendiente, transicionar a APROBADA con el pago inicial confirmado
        if (reservation.getStatus() == ReservationStatus.PENDIENTE) {
            reservation.transitionTo(ReservationStatus.APROBADA);
            reservation.setUpdatedAt(Instant.now());
            reservationRepository.save(reservation);
        }

        // Generar factura automática con IVA 19%
        String invoiceNum = "FAC-" + LocalDate.now().getYear() + "-" + String.format("%06d", savedPayment.getId());
        BigDecimal subtotalVal = reservation.getSubtotal().amount();
        BigDecimal taxVal = subtotalVal.multiply(new BigDecimal("0.19")).setScale(2, RoundingMode.HALF_UP);
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
        Long clientId = req.clientId();
        if (clientId == null) {
            clientId = reservationRepository.findById(req.reservationId())
                    .map(Reservation::getClientId)
                    .orElse(1L);
        }
        java.math.BigDecimal amount = req.amount();
        if (amount == null) {
            amount = reservationRepository.findById(req.reservationId())
                    .map(r -> r.getTotalAmount().amount())
                    .orElse(java.math.BigDecimal.ZERO);
        }
        ProcessPaymentCommand cmd = new ProcessPaymentCommand(
                req.reservationId(),
                clientId,
                req.paymentMethod(),
                Money.cop(amount),
                req.gatewayReference(),
                req.installmentCount() != null ? req.installmentCount() : 1
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

    public InstallmentPlanSummaryResponse getReservationInstallments(Long reservationId) {
        Payment payment = paymentRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró registro de pago para la reserva #" + reservationId));

        Reservation res = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + reservationId));

        List<PaymentInstallmentResponse> installmentDtos = new ArrayList<>();
        BigDecimal paidAmount = BigDecimal.ZERO;
        BigDecimal totalAmount = payment.getAmount() != null ? payment.getAmount().amount() : BigDecimal.ZERO;

        if (installmentRepository != null) {
            List<PaymentInstallment> list = installmentRepository.findByPaymentId(payment.getId());
            for (PaymentInstallment pi : list) {
                if (pi.isPaid()) {
                    paidAmount = paidAmount.add(pi.getTotalInstallmentAmount());
                }
                installmentDtos.add(new PaymentInstallmentResponse(
                        pi.getId(),
                        pi.getPaymentId(),
                        pi.getReservationId(),
                        pi.getInstallmentNumber(),
                        pi.getTotalInstallments(),
                        pi.getDueDate(),
                        pi.getPrincipalAmount(),
                        pi.getInterestAmount(),
                        pi.getTotalInstallmentAmount(),
                        pi.getStatus().name(),
                        pi.getPaidAt(),
                        pi.getTransactionRef()
                ));
            }
        }

        BigDecimal pendingAmount = totalAmount.subtract(paidAmount);
        if (pendingAmount.compareTo(BigDecimal.ZERO) < 0) pendingAmount = BigDecimal.ZERO;

        return new InstallmentPlanSummaryResponse(
                payment.getId(),
                reservationId,
                res.getReservationCode(),
                payment.getInstallmentCount() != null ? payment.getInstallmentCount() : 1,
                payment.getPaidInstallments() != null ? payment.getPaidInstallments() : 1,
                totalAmount,
                paidAmount,
                pendingAmount,
                payment.getPaymentStatus() != null ? payment.getPaymentStatus().name() : "COMPLETADO",
                installmentDtos
        );
    }

    public PaymentInstallmentResponse payInstallment(Long installmentId) {
        if (installmentRepository == null) {
            throw new BusinessRuleViolationException("Repositorio de cuotas no configurado.");
        }

        PaymentInstallment inst = installmentRepository.findById(installmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Cuota de pago no encontrada con ID: " + installmentId));

        if (inst.getStatus() == PaymentInstallmentStatus.PAGADA) {
            throw new BusinessRuleViolationException("La cuota #" + inst.getInstallmentNumber() + " ya se encuentra pagada.");
        }

        Payment payment = paymentRepository.findById(inst.getPaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Pago padre no encontrado con ID: " + inst.getPaymentId()));

        String txnRef = "TXN-INST-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        inst.markPaid(txnRef, Instant.now());
        installmentRepository.save(inst);

        payment.payInstallment();
        paymentRepository.save(payment);

        return new PaymentInstallmentResponse(
                inst.getId(),
                inst.getPaymentId(),
                inst.getReservationId(),
                inst.getInstallmentNumber(),
                inst.getTotalInstallments(),
                inst.getDueDate(),
                inst.getPrincipalAmount(),
                inst.getInterestAmount(),
                inst.getTotalInstallmentAmount(),
                inst.getStatus().name(),
                inst.getPaidAt(),
                inst.getTransactionRef()
        );
    }
}
