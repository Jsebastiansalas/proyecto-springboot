package com.renta.application.service;

import com.renta.application.dto.reservation.CreateReservationRequest;
import com.renta.application.dto.reservation.PriceCalculationResponse;
import com.renta.application.dto.reservation.ReservationResponse;
import com.renta.application.mapper.ReservationDtoMapper;
import com.renta.application.port.in.ReservationQueryUseCase;
import com.renta.domain.exception.BusinessRuleViolationException;
import com.renta.domain.exception.ReservationConflictException;
import com.renta.domain.exception.ResourceNotFoundException;
import com.renta.domain.exception.ToolNotAvailableException;
import com.renta.domain.model.entity.Client;
import com.renta.domain.model.entity.Payment;
import com.renta.domain.model.entity.Reservation;
import com.renta.domain.model.entity.Tool;
import com.renta.domain.model.enums.ReservationStatus;
import com.renta.domain.model.enums.ToolStatus;
import com.renta.domain.model.vo.DateRange;
import com.renta.domain.model.vo.Money;
import com.renta.application.dto.reservation.CancellationPenaltyResponse;
import com.renta.application.dto.reservation.ReservationExtensionResponse;
import com.renta.domain.model.vo.CancellationSettlement;
import com.renta.domain.model.vo.RentalPriceCalculation;
import com.renta.domain.port.in.ApproveReservationUseCase;
import com.renta.domain.port.in.CalculateRentalPriceUseCase;
import com.renta.domain.port.in.CancelReservationUseCase;
import com.renta.domain.port.in.CreateReservationUseCase;
import com.renta.domain.port.in.ExtendReservationUseCase;
import com.renta.domain.port.in.RejectReservationUseCase;
import com.renta.application.dto.reservation.ReservationAuditLogResponse;
import com.renta.domain.model.entity.ReservationStatusAuditLog;
import com.renta.domain.port.out.ReservationAuditLogRepositoryPort;
import com.renta.domain.port.out.ClientRepositoryPort;
import com.renta.domain.port.out.NotificationServicePort;
import com.renta.domain.port.out.PaymentRepositoryPort;
import com.renta.domain.port.out.ReservationRepositoryPort;
import com.renta.domain.port.out.ToolRepositoryPort;
import com.renta.domain.service.CancellationPolicy;
import com.renta.domain.service.RentalPricingCalculator;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * ============================================================================
 * SERVICIO DE GESTIÓN DE RESERVAS Y COTIZACIÓN DE ALQUILERES
 * ============================================================================
 */
public class ReservationApplicationService implements
        CreateReservationUseCase,
        ApproveReservationUseCase,
        CancelReservationUseCase,
        RejectReservationUseCase,
        CalculateRentalPriceUseCase,
        ReservationQueryUseCase,
        ExtendReservationUseCase {

    private final ReservationRepositoryPort reservationRepository;
    private final ToolRepositoryPort toolRepository;
    private final ClientRepositoryPort clientRepository;
    private final NotificationServicePort notificationService;
    private final PaymentRepositoryPort paymentRepository;
    private final ReservationAuditLogRepositoryPort auditLogRepository;

    public ReservationApplicationService(
            ReservationRepositoryPort reservationRepository,
            ToolRepositoryPort toolRepository,
            ClientRepositoryPort clientRepository,
            NotificationServicePort notificationService) {
        this(reservationRepository, toolRepository, clientRepository, notificationService, null, null);
    }

    public ReservationApplicationService(
            ReservationRepositoryPort reservationRepository,
            ToolRepositoryPort toolRepository,
            ClientRepositoryPort clientRepository,
            NotificationServicePort notificationService,
            PaymentRepositoryPort paymentRepository) {
        this(reservationRepository, toolRepository, clientRepository, notificationService, paymentRepository, null);
    }

    public ReservationApplicationService(
            ReservationRepositoryPort reservationRepository,
            ToolRepositoryPort toolRepository,
            ClientRepositoryPort clientRepository,
            NotificationServicePort notificationService,
            PaymentRepositoryPort paymentRepository,
            ReservationAuditLogRepositoryPort auditLogRepository) {
        this.reservationRepository = Objects.requireNonNull(reservationRepository, "reservationRepository es obligatorio");
        this.toolRepository = Objects.requireNonNull(toolRepository, "toolRepository es obligatorio");
        this.clientRepository = Objects.requireNonNull(clientRepository, "clientRepository es obligatorio");
        this.notificationService = Objects.requireNonNull(notificationService, "notificationService es obligatorio");
        this.paymentRepository = paymentRepository;
        this.auditLogRepository = auditLogRepository;
    }

    private void recordAudit(Long reservationId, ReservationStatus prevStatus, ReservationStatus newStatus, String changedBy, String reason) {
        if (auditLogRepository != null && reservationId != null) {
            try {
                auditLogRepository.save(ReservationStatusAuditLog.create(reservationId, prevStatus, newStatus, changedBy, reason));
            } catch (Exception ignored) {
            }
        }
    }

    /**
     * CREAR RESERVA DE ALQUILER
     * 
     * Flujo paso a paso:
     * - Paso 1: Verificar que la herramienta exista.
     * - Paso 2: Verificar que esté en estado DISPONIBLE (no en mantenimiento ni retirada).
     * - Paso 3: Verificar que el cliente que reserva esté registrado.
     * - Paso 4: Validar las fechas y verificar que NO se solapen con otra reserva activa.
     * - Paso 5: Calcular el costo exacto (días x tarifa + IVA 19% + fianza de garantía).
     * - Paso 6: Generar un código único legible (ej. RES-2026-A1B2C3).
     * - Paso 7: Guardar en la base de datos con estado PENDIENTE.
     */
    @Override
    public Reservation createReservation(CreateReservationCommand command) {
        // PASO 1: Buscar la herramienta
        Tool tool = toolRepository.findById(command.toolId())
                .orElseThrow(() -> new ResourceNotFoundException("Herramienta no encontrada con ID: " + command.toolId()));

        // PASO 2: Validar disponibilidad
        if (tool.getStatus() != ToolStatus.DISPONIBLE) {
            throw new ToolNotAvailableException(command.toolId(),
                    "La herramienta '" + tool.getName() + "' no está disponible (Estado actual: " + tool.getStatus() + ")");
        }

        // PASO 3: Validar que el cliente exista
        if (!clientRepository.findById(command.clientId()).isPresent()) {
            throw new ResourceNotFoundException("Cliente no encontrado con ID: " + command.clientId());
        }

        // PASO 4: Validar rango de fechas y solapamientos
        DateRange dateRange = DateRange.of(command.startDate(), command.endDate());
        if (dateRange.totalDays() > 30) {
            throw new IllegalArgumentException("El periodo de alquiler no puede exceder los 30 días calendario (1 mes) por contrato");
        }

        int maxStock = tool.getStockQuantity() != null ? tool.getStockQuantity() : 1;
        if (maxStock <= 1) {
            if (reservationRepository.existsOverlapping(command.toolId(), dateRange)) {
                throw new ReservationConflictException(command.toolId(),
                        "La herramienta ya tiene una reserva activa que se solapa con las fechas solicitadas: " + dateRange);
            }
        } else {
            List<Reservation> activeOverlapping = reservationRepository.findOverlappingReservations(
                    command.toolId(),
                    dateRange,
                    List.of(ReservationStatus.APROBADA, ReservationStatus.EN_CURSO)
            );
            if (activeOverlapping.size() >= maxStock) {
                throw new ReservationConflictException(command.toolId(),
                        String.format("La herramienta ya tiene %d de %d unidades reservadas en esas fechas",
                                activeOverlapping.size(), maxStock));
            }
        }

        // PASO 5: Calcular costos financieros (incluye Seguro Todo Riesgo)
        int totalDays = dateRange.totalDays();
        RentalPricingCalculator calculator = new RentalPricingCalculator();
        RentalPriceCalculation calc = calculator.calculate(
                tool.getBaseDailyPrice(),
                tool.getDepositAmount(),
                totalDays,
                command.includeDamageWaiver()
        );

        Money subtotal = calc.subtotal();
        Money deposit = calc.depositAmount();
        Money total = calc.totalReservationAmount();

        // PASO 6: Generar código de reserva único
        String code = "RES-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        Instant now = Instant.now();

        // PASO 7: Instanciar la entidad en estado PENDIENTE y persistir
        Reservation reservation = new Reservation(
                null,
                code,
                command.clientId(),
                command.toolId(),
                dateRange,
                totalDays,
                subtotal,
                deposit,
                total,
                ReservationStatus.PENDIENTE,
                command.notes(),
                now,
                now
        );
        reservation.setHasDamageInsurance(calc.damageInsuranceApplied());
        reservation.setInsuranceCost(calc.insuranceCost());

        Reservation saved = reservationRepository.save(reservation);
        recordAudit(saved.getId(), null, ReservationStatus.PENDIENTE, "CLIENTE #" + command.clientId(), "Creación de reserva inicial");
        return saved;
    }

    public ReservationResponse createFromRequest(CreateReservationRequest req) {
        CreateReservationCommand cmd = new CreateReservationCommand(
                req.clientId(),
                req.toolId(),
                req.startDate(),
                req.endDate(),
                req.notes(),
                Boolean.TRUE.equals(req.includeDamageWaiver())
        );
        Reservation saved = createReservation(cmd);
        return enrichReservationResponse(saved);
    }

    @Override
    public Reservation approveReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + reservationId));

        reservation.transitionTo(ReservationStatus.APROBADA);
        reservation.setUpdatedAt(Instant.now());
        Reservation saved = reservationRepository.save(reservation);

        notificationService.notifyReservationApproved(saved);
        return saved;
    }

    @Override
    public Reservation cancelReservation(Long reservationId, String reason) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + reservationId));

        reservation.transitionTo(ReservationStatus.CANCELADA);
        reservation.setNotes((reservation.getNotes() != null ? reservation.getNotes() + " | " : "") + "Cancelada: " + reason);
        reservation.setUpdatedAt(Instant.now());
        Reservation saved = reservationRepository.save(reservation);

        notificationService.notifyReservationCancelled(saved, reason);
        return saved;
    }

    @Override
    public Reservation rejectReservation(Long reservationId, String reason) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + reservationId));

        reservation.transitionTo(ReservationStatus.RECHAZADA);
        reservation.setNotes((reservation.getNotes() != null ? reservation.getNotes() + " | " : "") + "Rechazada: " + reason);
        reservation.setUpdatedAt(Instant.now());
        return reservationRepository.save(reservation);
    }

    @Override
    public RentalPriceCalculation calculatePrice(Long toolId, DateRange dateRange) {
        Tool tool = toolRepository.findById(toolId)
                .orElseThrow(() -> new ResourceNotFoundException("Herramienta no encontrada con ID: " + toolId));
        return new RentalPricingCalculator().calculate(tool.getBaseDailyPrice(), dateRange.totalDays());
    }

    @Override
    public RentalPriceCalculation calculatePrice(BigDecimal baseDailyPrice, int totalDays) {
        return new RentalPricingCalculator().calculate(Money.cop(baseDailyPrice), totalDays);
    }

    public PriceCalculationResponse calculatePriceDetailed(Long toolId, LocalDate start, LocalDate end) {
        Tool tool = toolRepository.findById(toolId)
                .orElseThrow(() -> new ResourceNotFoundException("Herramienta no encontrada con ID: " + toolId));
        DateRange range = DateRange.of(start, end);
        int days = range.totalDays();
        RentalPriceCalculation calc = new RentalPricingCalculator().calculate(tool.getBaseDailyPrice(), days);

        BigDecimal effectiveDaily = calc.subtotal().amount().divide(BigDecimal.valueOf(days), 2, java.math.RoundingMode.HALF_UP);
        boolean weeklyApplied = days >= 7;
        BigDecimal total = calc.subtotal().amount().add(tool.getDepositAmount().amount());

        return new PriceCalculationResponse(
                tool.getId(),
                tool.getName(),
                start,
                end,
                days,
                tool.getBaseDailyPrice().amount(),
                effectiveDaily,
                weeklyApplied,
                calc.subtotal().amount(),
                calc.taxAmount().amount(),
                tool.getDepositAmount().amount(),
                total
        );
    }

    @Override
    public ReservationResponse getReservationById(Long id) {
        Reservation res = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + id));
        return enrichReservationResponse(res);
    }

    @Override
    public ReservationResponse getReservationByCode(String code) {
        Reservation res = reservationRepository.findByReservationCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con código: " + code));
        return enrichReservationResponse(res);
    }

    @Override
    public List<ReservationResponse> listReservationsByClient(Long clientId) {
        return reservationRepository.findByClientId(clientId).stream()
                .map(this::enrichReservationResponse)
                .toList();
    }

    @Override
    public List<ReservationResponse> listReservationsByProvider(Long providerId) {
        // Encontrar herramientas del proveedor y luego sus reservas
        List<Tool> tools = toolRepository.findByProviderId(providerId);
        return tools.stream()
                .flatMap(t -> reservationRepository.findByToolId(t.getId()).stream())
                .map(this::enrichReservationResponse)
                .toList();
    }

    @Override
    public List<ReservationResponse> listReservationsByTool(Long toolId) {
        return reservationRepository.findByToolId(toolId).stream()
                .filter(r -> r.getStatus() == ReservationStatus.APROBADA || r.getStatus() == ReservationStatus.EN_CURSO)
                .map(this::enrichReservationResponse)
                .toList();
    }

    @Override
    public List<ReservationResponse> listAllReservations() {
        // Obtenemos todas las reservas iterando sobre las herramientas disponibles
        List<Tool> allTools = toolRepository.findAllAvailable();
        return allTools.stream()
                .flatMap(t -> reservationRepository.findByToolId(t.getId()).stream())
                .distinct()
                .map(this::enrichReservationResponse)
                .toList();
    }

    private ReservationResponse enrichReservationResponse(Reservation res) {
        String clientName = clientRepository.findById(res.getClientId())
                .map(Client::getFullName)
                .orElse("Cliente #" + res.getClientId());
        String toolName = "Herramienta #" + res.getToolId();
        String toolImageUrl = null;
        var toolOpt = toolRepository.findById(res.getToolId());
        if (toolOpt.isPresent()) {
            toolName = toolOpt.get().getName();
            toolImageUrl = toolOpt.get().getMainImageUrl();
        }
        Payment payment = null;
        if (paymentRepository != null) {
            payment = paymentRepository.findByReservationId(res.getId()).orElse(null);
        }
        return ReservationDtoMapper.toResponse(res, clientName, toolName, toolImageUrl, payment);
    }

    /**
     * EXTENSIÓN / PRÓRROGA DE CONTRATO DE ALQUILER
     */
    @Override
    public Reservation extendReservation(Long reservationId, LocalDate newEndDate, String reason) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + reservationId));

        if (reservation.getStatus() != ReservationStatus.APROBADA && reservation.getStatus() != ReservationStatus.EN_CURSO) {
            throw new BusinessRuleViolationException(
                    "Solo se pueden prorrogar reservas en estado APROBADA o EN_CURSO. Estado actual: " + reservation.getStatus()
            );
        }

        LocalDate currentEndDate = reservation.getDateRange().endDate();
        if (!newEndDate.isAfter(currentEndDate)) {
            throw new BusinessRuleViolationException(
                    String.format("La nueva fecha (%s) debe ser estrictamente posterior a la fecha actual de finalización (%s)",
                            newEndDate, currentEndDate)
            );
        }

        Long toolId = reservation.getToolId();
        LocalDate extensionStartDate = currentEndDate.plusDays(1);
        DateRange extensionRange = new DateRange(extensionStartDate, newEndDate);
        List<Reservation> overlapping = reservationRepository.findOverlappingReservations(
                toolId,
                extensionRange,
                List.of(ReservationStatus.APROBADA, ReservationStatus.EN_CURSO)
        );

        boolean hasConflict = overlapping.stream()
                .anyMatch(r -> !r.getId().equals(reservationId));

        if (hasConflict) {
            throw new ReservationConflictException(
                    "No es posible extender el alquiler: la maquinaria ya tiene otra reserva confirmada en las fechas solicitadas."
            );
        }

        Tool tool = toolRepository.findById(toolId)
                .orElseThrow(() -> new ResourceNotFoundException("Herramienta no encontrada"));

        int additionalDays = (int) ChronoUnit.DAYS.between(currentEndDate, newEndDate);
        Money dailyPrice = tool.getBaseDailyPrice();
        Money additionalSubtotal = dailyPrice.multiply(additionalDays);

        BigDecimal ivaRate = RentalPricingCalculator.IVA_RATE.divide(BigDecimal.valueOf(100));
        Money additionalTax = Money.of(additionalSubtotal.amount().multiply(ivaRate));
        Money additionalTotal = additionalSubtotal.plus(additionalTax);

        DateRange newRange = new DateRange(reservation.getDateRange().startDate(), newEndDate);
        reservation.setDateRange(newRange);
        reservation.setTotalDays(newRange.durationInDays());
        reservation.setSubtotal(reservation.getSubtotal().plus(additionalSubtotal));
        reservation.setTotalAmount(reservation.getTotalAmount().plus(additionalTotal));

        String logNote = String.format("[Prórroga concedida: +%d días hasta %s. Motivo: %s]",
                additionalDays, newEndDate, reason != null ? reason : "Sin especificar");
        reservation.setNotes((reservation.getNotes() != null ? reservation.getNotes() + " | " : "") + logNote);

        Reservation saved = reservationRepository.save(reservation);

        if (notificationService != null) {
            notificationService.notifyReservationApproved(saved);
        }

        recordAudit(saved.getId(), saved.getStatus(), saved.getStatus(), "USUARIO", logNote);

        return saved;
    }

    public ReservationExtensionResponse extendReservationAndGetResponse(Long reservationId, LocalDate newEndDate, String reason) {
        Reservation before = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada"));
        LocalDate oldEnd = before.getDateRange().endDate();
        BigDecimal oldSubtotal = before.getSubtotal().amount();

        Reservation updated = extendReservation(reservationId, newEndDate, reason);

        int additionalDays = (int) ChronoUnit.DAYS.between(oldEnd, newEndDate);
        BigDecimal additionalCost = updated.getSubtotal().amount().subtract(oldSubtotal);
        BigDecimal additionalIva = additionalCost.multiply(BigDecimal.valueOf(0.19));

        return new ReservationExtensionResponse(
                updated.getId(),
                updated.getReservationCode(),
                oldEnd,
                updated.getDateRange().endDate(),
                additionalDays,
                updated.getTotalDays(),
                additionalCost,
                additionalIva,
                updated.getSubtotal().amount(),
                updated.getTotalAmount().amount(),
                updated.getStatus().name(),
                reason,
                "Prórroga de alquiler procesada exitosamente."
        );
    }

    /**
     * CANCELACIÓN CON LIQUIDACIÓN Y PENALIZACIÓN FINANCIERA
     */
    public CancellationPenaltyResponse cancelWithFinancialSettlement(Long reservationId, String reason) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + reservationId));

        String oldStatus = reservation.getStatus().name();

        CancellationSettlement settlement = CancellationPolicy.evaluate(reservation, LocalDateTime.now());

        String effectiveReason = (reason != null && !reason.isBlank()) ? reason : "Cancelación por solicitud del usuario";
        reservation.cancel(String.format("%s. Penalización aplicada: %s%% ($%s)",
                effectiveReason, settlement.penaltyPercentage(), settlement.penaltyFeeAmount().amount()));

        Reservation updated = reservationRepository.save(reservation);

        if (notificationService != null) {
            notificationService.notifyReservationCancelled(updated, effectiveReason);
        }

        recordAudit(updated.getId(), ReservationStatus.valueOf(oldStatus), ReservationStatus.CANCELADA, "USUARIO", effectiveReason);

        return new CancellationPenaltyResponse(
                updated.getId(),
                updated.getReservationCode(),
                oldStatus,
                updated.getStatus().name(),
                settlement.originalTotalAmount().amount(),
                settlement.penaltyPercentage(),
                settlement.penaltyFeeAmount().amount(),
                settlement.refundedDepositAmount().amount(),
                settlement.totalRefundedToClient().amount(),
                settlement.policyExplanation(),
                effectiveReason
        );
    }

    /**
     * Consulta el historial cronológico de auditoría de estados de la reserva.
     */
    public List<ReservationAuditLogResponse> getAuditTrail(Long reservationId) {
        if (auditLogRepository == null) {
            return Collections.emptyList();
        }
        return auditLogRepository.findByReservationIdOrderByChangedAtDesc(reservationId).stream()
                .map(log -> new ReservationAuditLogResponse(
                        log.getId(),
                        log.getReservationId(),
                        log.getPreviousStatus() != null ? log.getPreviousStatus().name() : null,
                        log.getNewStatus().name(),
                        log.getChangedBy(),
                        log.getChangedAt(),
                        log.getReason()
                ))
                .toList();
    }
}
