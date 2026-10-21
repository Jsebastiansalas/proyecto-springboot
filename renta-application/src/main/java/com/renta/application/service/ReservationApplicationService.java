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
import com.renta.domain.model.vo.RentalPriceCalculation;
import com.renta.domain.port.in.ApproveReservationUseCase;
import com.renta.domain.port.in.CalculateRentalPriceUseCase;
import com.renta.domain.port.in.CancelReservationUseCase;
import com.renta.domain.port.in.CreateReservationUseCase;
import com.renta.domain.port.in.RejectReservationUseCase;
import com.renta.domain.port.out.ClientRepositoryPort;
import com.renta.domain.port.out.NotificationServicePort;
import com.renta.domain.port.out.PaymentRepositoryPort;
import com.renta.domain.port.out.ReservationRepositoryPort;
import com.renta.domain.port.out.ToolRepositoryPort;
import com.renta.domain.service.RentalPricingCalculator;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * ============================================================================
 * SERVICIO DE GESTIÓN DE RESERVAS Y COTIZACIÓN DE ALQUILERES
 * ============================================================================
 * 
 * ¿QUÉ HACE ESTE SERVICIO?
 * Es el núcleo del negocio de alquileres. Gestiona todo el proceso:
 * 1. Cotizar precios antes de alquilar (aplica descuento semanal e IVA 19%).
 * 2. Crear una reserva validando que no choque con otras en el calendario.
 * 3. Aprobar, rechazar o cancelar contratos de reserva.
 * 4. Consultar el historial de alquileres por cliente, proveedor o máquina.
 */
public class ReservationApplicationService implements
        CreateReservationUseCase,
        ApproveReservationUseCase,
        CancelReservationUseCase,
        RejectReservationUseCase,
        CalculateRentalPriceUseCase,
        ReservationQueryUseCase {

    private final ReservationRepositoryPort reservationRepository;
    private final ToolRepositoryPort toolRepository;
    private final ClientRepositoryPort clientRepository;
    private final NotificationServicePort notificationService;
    private final PaymentRepositoryPort paymentRepository;

    public ReservationApplicationService(
            ReservationRepositoryPort reservationRepository,
            ToolRepositoryPort toolRepository,
            ClientRepositoryPort clientRepository,
            NotificationServicePort notificationService) {
        this(reservationRepository, toolRepository, clientRepository, notificationService, null);
    }

    public ReservationApplicationService(
            ReservationRepositoryPort reservationRepository,
            ToolRepositoryPort toolRepository,
            ClientRepositoryPort clientRepository,
            NotificationServicePort notificationService,
            PaymentRepositoryPort paymentRepository) {
        this.reservationRepository = Objects.requireNonNull(reservationRepository, "reservationRepository es obligatorio");
        this.toolRepository = Objects.requireNonNull(toolRepository, "toolRepository es obligatorio");
        this.clientRepository = Objects.requireNonNull(clientRepository, "clientRepository es obligatorio");
        this.notificationService = Objects.requireNonNull(notificationService, "notificationService es obligatorio");
        this.paymentRepository = paymentRepository;
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
        if (reservationRepository.existsOverlapping(command.toolId(), dateRange)) {
            throw new ReservationConflictException(command.toolId(),
                    "La herramienta ya tiene una reserva activa que se solapa con las fechas solicitadas: " + dateRange);
        }

        // PASO 5: Calcular costos financieros
        int totalDays = dateRange.totalDays();
        RentalPricingCalculator calculator = new RentalPricingCalculator();
        RentalPriceCalculation calc = calculator.calculate(tool.getBaseDailyPrice(), totalDays);

        Money subtotal = calc.subtotal();
        Money deposit = tool.getDepositAmount();
        Money total = subtotal.plus(deposit);

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

        return reservationRepository.save(reservation);
    }

    public ReservationResponse createFromRequest(CreateReservationRequest req) {
        CreateReservationCommand cmd = new CreateReservationCommand(
                req.clientId(),
                req.toolId(),
                req.startDate(),
                req.endDate(),
                req.notes()
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
}
