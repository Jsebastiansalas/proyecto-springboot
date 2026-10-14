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
import com.renta.domain.port.out.ReservationRepositoryPort;
import com.renta.domain.port.out.ToolRepositoryPort;
import com.renta.domain.service.RentalPricingCalculator;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

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

    public ReservationApplicationService(
            ReservationRepositoryPort reservationRepository,
            ToolRepositoryPort toolRepository,
            ClientRepositoryPort clientRepository,
            NotificationServicePort notificationService) {
        this.reservationRepository = Objects.requireNonNull(reservationRepository);
        this.toolRepository = Objects.requireNonNull(toolRepository);
        this.clientRepository = Objects.requireNonNull(clientRepository);
        this.notificationService = Objects.requireNonNull(notificationService);
    }

    @Override
    public Reservation createReservation(CreateReservationCommand command) {
        Tool tool = toolRepository.findById(command.toolId())
                .orElseThrow(() -> new ResourceNotFoundException("Herramienta no encontrada con ID: " + command.toolId()));

        if (tool.getStatus() != ToolStatus.DISPONIBLE) {
            throw new ToolNotAvailableException(command.toolId(),
                    "La herramienta '" + tool.getName() + "' no está disponible (Estado actual: " + tool.getStatus() + ")");
        }

        if (!clientRepository.findById(command.clientId()).isPresent()) {
            throw new ResourceNotFoundException("Cliente no encontrado con ID: " + command.clientId());
        }

        DateRange dateRange = DateRange.of(command.startDate(), command.endDate());

        // Comprobar solapamiento de fechas con otras reservas activas
        if (reservationRepository.existsOverlapping(command.toolId(), dateRange)) {
            throw new ReservationConflictException(command.toolId(),
                    "La herramienta ya tiene una reserva activa que se solapa con las fechas solicitadas: " + dateRange);
        }

        int totalDays = dateRange.totalDays();
        RentalPricingCalculator calculator = new RentalPricingCalculator();
        RentalPriceCalculation calc = calculator.calculate(tool.getBaseDailyPrice(), totalDays);

        Money subtotal = calc.subtotal();
        Money deposit = tool.getDepositAmount();
        Money total = subtotal.plus(deposit);

        String code = "RES-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        Instant now = Instant.now();

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
        return ReservationDtoMapper.toResponse(res, clientName, toolName, toolImageUrl);
    }
}
