package com.renta.application.service;

import com.renta.application.dto.delivery.DamageReportRequest;
import com.renta.application.dto.delivery.DamageReportResponse;
import com.renta.application.dto.delivery.DepositSettlementResponse;
import com.renta.application.dto.delivery.FinishRentalRequest;
import com.renta.application.dto.delivery.RentalDeliveryResponse;
import com.renta.application.dto.delivery.RentalReturnResponse;
import com.renta.application.dto.delivery.StartRentalRequest;
import com.renta.application.mapper.DeliveryReturnDtoMapper;
import com.renta.domain.exception.BusinessRuleViolationException;
import com.renta.domain.exception.ResourceNotFoundException;
import com.renta.domain.model.entity.DamageReport;
import com.renta.domain.model.entity.RentalDelivery;
import com.renta.domain.model.entity.RentalReturn;
import com.renta.domain.model.entity.Reservation;
import com.renta.domain.model.enums.DamageReportStatus;
import com.renta.domain.model.enums.ReservationStatus;
import com.renta.domain.model.enums.ToolConditionStatus;
import com.renta.domain.model.enums.ToolStatus;
import com.renta.domain.model.vo.DepositSettlement;
import com.renta.domain.model.vo.Money;
import com.renta.domain.port.in.FinalizeRentalUseCase;
import com.renta.domain.port.in.FinishRentalUseCase;
import com.renta.domain.port.in.GetSettlementUseCase;
import com.renta.domain.port.in.RegisterDamageReportUseCase;
import com.renta.domain.port.in.StartRentalUseCase;
import com.renta.domain.port.out.ClientRepositoryPort;
import com.renta.domain.port.out.DamageReportRepositoryPort;
import com.renta.domain.port.out.RentalDeliveryRepositoryPort;
import com.renta.domain.port.out.RentalReturnRepositoryPort;
import com.renta.domain.port.out.ReservationRepositoryPort;
import com.renta.domain.port.out.ToolRepositoryPort;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

public class DeliveryReturnApplicationService implements
        StartRentalUseCase,
        FinishRentalUseCase,
        FinalizeRentalUseCase,
        RegisterDamageReportUseCase,
        GetSettlementUseCase {

    private final RentalDeliveryRepositoryPort deliveryRepository;
    private final RentalReturnRepositoryPort returnRepository;
    private final DamageReportRepositoryPort damageReportRepository;
    private final ReservationRepositoryPort reservationRepository;
    private final ToolRepositoryPort toolRepository;
    private final ClientRepositoryPort clientRepository;

    public DeliveryReturnApplicationService(
            RentalDeliveryRepositoryPort deliveryRepository,
            RentalReturnRepositoryPort returnRepository,
            DamageReportRepositoryPort damageReportRepository,
            ReservationRepositoryPort reservationRepository) {
        this(deliveryRepository, returnRepository, damageReportRepository, reservationRepository, null, null);
    }

    public DeliveryReturnApplicationService(
            RentalDeliveryRepositoryPort deliveryRepository,
            RentalReturnRepositoryPort returnRepository,
            DamageReportRepositoryPort damageReportRepository,
            ReservationRepositoryPort reservationRepository,
            ToolRepositoryPort toolRepository,
            ClientRepositoryPort clientRepository) {
        this.deliveryRepository = Objects.requireNonNull(deliveryRepository);
        this.returnRepository = Objects.requireNonNull(returnRepository);
        this.damageReportRepository = Objects.requireNonNull(damageReportRepository);
        this.reservationRepository = Objects.requireNonNull(reservationRepository);
        this.toolRepository = toolRepository;
        this.clientRepository = clientRepository;
    }

    @Override
    public RentalDelivery startRental(StartRentalCommand command) {
        Reservation res = reservationRepository.findById(command.reservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + command.reservationId()));

        if (deliveryRepository.findByReservationId(res.getId()).isPresent()) {
            throw new BusinessRuleViolationException("La entrega ya fue registrada previamente para esta reserva");
        }

        // Transición de estado a EN_CURSO
        res.transitionTo(ReservationStatus.EN_CURSO);
        res.setUpdatedAt(Instant.now());
        reservationRepository.save(res);

        RentalDelivery delivery = new RentalDelivery(
                null,
                res.getId(),
                Instant.now(),
                command.deliveredBy(),
                command.initialConditionNotes(),
                command.clientSignatureAck()
        );
        return deliveryRepository.save(delivery);
    }

    public RentalDeliveryResponse startRentalFromRequest(StartRentalRequest req) {
        StartRentalCommand cmd = new StartRentalCommand(
                req.reservationId(),
                req.deliveredBy(),
                req.initialConditionNotes(),
                req.clientSignatureAck()
        );
        RentalDelivery d = startRental(cmd);
        String code = reservationRepository.findById(d.getReservationId())
                .map(Reservation::getReservationCode)
                .orElse("RES-" + d.getReservationId());
        return DeliveryReturnDtoMapper.toDeliveryResponse(d, code);
    }

    @Override
    public RentalReturn finishRental(FinishRentalCommand command) {
        Reservation res = reservationRepository.findById(command.reservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + command.reservationId()));

        if (returnRepository.findByReservationId(res.getId()).isPresent()) {
            throw new BusinessRuleViolationException("La devolución ya fue registrada previamente para esta reserva");
        }

        // Transición de estado a FINALIZADA
        res.transitionTo(ReservationStatus.FINALIZADA);
        res.setUpdatedAt(Instant.now());
        reservationRepository.save(res);

        RentalReturn ret = new RentalReturn(
                null,
                res.getId(),
                Instant.now(),
                command.receivedBy(),
                command.conditionStatus(),
                command.inspectionNotes(),
                command.depositRefunded(),
                command.extraDamageFee()
        );
        RentalReturn savedReturn = returnRepository.save(ret);

        // Actualización de estado de la herramienta según la condición de entrega
        if (toolRepository != null) {
            toolRepository.findById(res.getToolId()).ifPresent(tool -> {
                if (command.conditionStatus() == ToolConditionStatus.DANADO || command.conditionStatus() == ToolConditionStatus.INOPERATIVO) {
                    tool.setStatus(ToolStatus.MANTENIMIENTO);
                } else if (command.conditionStatus() == ToolConditionStatus.EXCELENTE || command.conditionStatus() == ToolConditionStatus.BUENO) {
                    tool.setStatus(ToolStatus.DISPONIBLE);
                }
                toolRepository.save(tool);
            });
        }

        return savedReturn;
    }

    public RentalReturnResponse finishRentalFromRequest(FinishRentalRequest req) {
        Reservation res = reservationRepository.findById(req.reservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + req.reservationId()));

        Money deposit = res.getDepositTotal();
        Money damageCost = req.repairCostEstimate() != null ? Money.cop(req.repairCostEstimate())
                : (req.extraDamageFee() != null ? Money.cop(req.extraDamageFee()) : Money.zero());

        DepositSettlement settlement = DepositSettlement.calculate(deposit, damageCost);
        boolean refunded = req.depositRefunded() != null ? req.depositRefunded() : settlement.refundAmount().isGreaterThan(Money.zero());
        Money extraFee = settlement.extraChargeDue();

        FinishRentalCommand cmd = new FinishRentalCommand(
                req.reservationId(),
                req.receivedBy(),
                req.conditionStatus(),
                req.inspectionNotes(),
                refunded,
                extraFee
        );
        RentalReturn r = finishRental(cmd);
        String code = res.getReservationCode();
        return DeliveryReturnDtoMapper.toReturnResponse(r, code);
    }

    @Override
    public DamageReport registerDamageReport(RegisterDamageReportCommand command) {
        RentalReturn ret = returnRepository.findById(command.returnId())
                .orElseThrow(() -> new ResourceNotFoundException("Devolución no encontrada con ID: " + command.returnId()));

        DamageReport rep = new DamageReport(
                null,
                ret.getId(),
                command.reportedBy(),
                command.damageType(),
                command.description(),
                command.repairCostEstimate(),
                DamageReportStatus.EVALUANDO,
                Instant.now()
        );
        return damageReportRepository.save(rep);
    }

    public DamageReportResponse registerDamageFromRequest(DamageReportRequest req) {
        DamageReportStatus status = req.status() != null ? req.status() : DamageReportStatus.EVALUANDO;
        Money cost = Money.cop(req.repairCostEstimate());
        RentalReturn ret = returnRepository.findById(req.returnId())
                .orElseThrow(() -> new ResourceNotFoundException("Devolución no encontrada con ID: " + req.returnId()));

        DamageReport rep = new DamageReport(
                null,
                ret.getId(),
                req.reportedBy(),
                req.damageType(),
                req.description(),
                cost,
                status,
                Instant.now()
        );
        DamageReport saved = damageReportRepository.save(rep);
        return DeliveryReturnDtoMapper.toDamageResponse(saved);
    }

    public List<DamageReportResponse> listDamageReportsByReturnId(Long returnId) {
        return damageReportRepository.findByReturnId(returnId).stream()
                .map(DeliveryReturnDtoMapper::toDamageResponse)
                .toList();
    }

    @Override
    public DepositSettlement getSettlementByReservationId(Long reservationId) {
        Reservation res = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + reservationId));
        RentalReturn ret = returnRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("La reserva no cuenta con acta de devolución registrada"));

        List<DamageReport> damages = damageReportRepository.findByReturnId(ret.getId());
        Money totalDamage = damages.stream()
                .map(DamageReport::getRepairCostEstimate)
                .filter(Objects::nonNull)
                .reduce(Money.zero(), Money::add);

        if (totalDamage.equals(Money.zero()) && ret.getExtraDamageFee() != null) {
            totalDamage = ret.getExtraDamageFee();
        }

        return DepositSettlement.calculate(res.getDepositTotal(), totalDamage);
    }

    public DepositSettlementResponse getSettlementResponse(Long reservationId) {
        Reservation res = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + reservationId));
        RentalReturn ret = returnRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("La reserva no cuenta con acta de devolución registrada"));

        DepositSettlement settlement = getSettlementByReservationId(reservationId);

        String clientName = clientRepository != null ? clientRepository.findById(res.getClientId())
                .map(c -> c.getFirstName() + " " + c.getLastName())
                .orElse("Cliente #" + res.getClientId()) : "Cliente #" + res.getClientId();

        String toolName = toolRepository != null ? toolRepository.findById(res.getToolId())
                .map(t -> t.getName() + " (" + t.getBrand() + ")")
                .orElse("Herramienta #" + res.getToolId()) : "Herramienta #" + res.getToolId();

        return new DepositSettlementResponse(
                res.getId(),
                res.getReservationCode(),
                clientName,
                toolName,
                settlement.initialDeposit().amount(),
                settlement.damageDeduction().amount(),
                settlement.refundAmount().amount(),
                settlement.extraChargeDue().amount(),
                settlement.status(),
                ret.getToolConditionStatus(),
                ret.getInspectionNotes(),
                ret.getReturnDate()
        );
    }
}
