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
import com.renta.domain.model.entity.Tool;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * ============================================================================
 * SERVICIO DE LOGÍSTICA: ENTREGAS, DEVOLUCIONES Y LIQUIDACIÓN DE GARANTÍA
 * ============================================================================
 * 
 * ¿QUÉ HACE ESTE SERVICIO?
 * Controla el ciclo de vida operativo de una herramienta cuando sale y entra de la bodega:
 * 1. Despachar herramienta al cliente -> Transiciona reserva a EN_CURSO (startRental).
 * 2. Recibir herramienta devuelta -> Transiciona reserva a FINALIZADA (finishRental).
 * 3. Evaluar condición física: Si vuelve averiada, la herramienta pasa a MANTENIMIENTO;
 *    si vuelve en buen estado, vuelve a estar DISPONIBLE para otros clientes.
 * 4. Liquidar la fianza / depósito de garantía: Si hay costo de reparación, se descuenta
 *    automáticamente y se devuelve solo la diferencia al cliente (o se cobra saldo extra).
 */
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
        this.deliveryRepository = Objects.requireNonNull(deliveryRepository, "deliveryRepository es obligatorio");
        this.returnRepository = Objects.requireNonNull(returnRepository, "returnRepository es obligatorio");
        this.damageReportRepository = Objects.requireNonNull(damageReportRepository, "damageReportRepository es obligatorio");
        this.reservationRepository = Objects.requireNonNull(reservationRepository, "reservationRepository es obligatorio");
        this.toolRepository = toolRepository;
        this.clientRepository = clientRepository;
    }

    /**
     * PASO 1 OPERATIVO: REGISTRAR ENTREGA DE LA MÁQUINA AL CLIENTE
     */
    @Override
    public RentalDelivery startRental(StartRentalCommand command) {
        // 1. Buscar la reserva en la base de datos
        Reservation res = reservationRepository.findById(command.reservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + command.reservationId()));

        // 2. Validar que no se haya entregado ya antes
        if (deliveryRepository.findByReservationId(res.getId()).isPresent()) {
            throw new BusinessRuleViolationException("La entrega ya fue registrada previamente para esta reserva");
        }

        // 3. Cambiar estado de la reserva a EN_CURSO
        res.transitionTo(ReservationStatus.EN_CURSO);
        res.setUpdatedAt(Instant.now());
        reservationRepository.save(res);

        // 4. Crear y guardar el acta física de entrega
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

    /**
     * PASO 2 OPERATIVO: REGISTRAR DEVOLUCIÓN DE LA MÁQUINA POR EL CLIENTE
     */
    @Override
    public RentalReturn finishRental(FinishRentalCommand command) {
        // 1. Buscar la reserva
        Reservation res = reservationRepository.findById(command.reservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + command.reservationId()));

        // 2. Validar que no haya sido devuelta ya
        if (returnRepository.findByReservationId(res.getId()).isPresent()) {
            throw new BusinessRuleViolationException("La devolución ya fue registrada previamente para esta reserva");
        }

        // 3. Cambiar estado de la reserva a FINALIZADA
        res.transitionTo(ReservationStatus.FINALIZADA);
        res.setUpdatedAt(Instant.now());
        reservationRepository.save(res);

        // 4. Guardar el acta de devolución
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

        // 5. REGLA INTELIGENTE: Si la máquina volvió dañada, ponerla en MANTENIMIENTO.
        //    Si volvió en buen estado, ponerla DISPONIBLE.
        if (toolRepository != null) {
            toolRepository.findById(res.getToolId()).ifPresent(tool -> {
                ToolConditionStatus condicion = command.conditionStatus();
                if (condicion == ToolConditionStatus.DANADO || condicion == ToolConditionStatus.INOPERATIVO) {
                    tool.setStatus(ToolStatus.MANTENIMIENTO);
                } else if (condicion == ToolConditionStatus.EXCELENTE || condicion == ToolConditionStatus.BUENO) {
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

        // Calcular automáticamente la liquidación de fianza
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

    /**
     * PASO 3 OPERATIVO: REGISTRAR UN INFORME DE DAÑOS O AVERÍAS
     */
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
        List<DamageReport> reports = damageReportRepository.findByReturnId(returnId);
        List<DamageReportResponse> result = new ArrayList<>();
        for (DamageReport rep : reports) {
            result.add(DeliveryReturnDtoMapper.toDamageResponse(rep));
        }
        return result;
    }

    /**
     * PASO 4 OPERATIVO: LIQUIDACIÓN FINANCIERA DE LA GARANTÍA
     * 
     * Calcula cuánto dinero se devuelve al cliente y cuánto se retiene:
     * - Reembolso = Depósito Inicial - Costo Daños
     * - Si el daño es mayor al depósito, Reembolso = 0 y genera un Saldo a Cobrar.
     */
    @Override
    public DepositSettlement getSettlementByReservationId(Long reservationId) {
        // 1. Obtener la reserva y su devolución
        Reservation res = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + reservationId));
        RentalReturn ret = returnRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("La reserva no cuenta con acta de devolución registrada"));

        // 2. Sumar todos los costos estimados de los reportes de daños asociados
        List<DamageReport> damages = damageReportRepository.findByReturnId(ret.getId());
        Money totalDamage = Money.zero();
        for (DamageReport damage : damages) {
            if (damage.getRepairCostEstimate() != null) {
                totalDamage = totalDamage.plus(damage.getRepairCostEstimate());
            }
        }

        // Si no hubo reportes detallados pero sí se fijó una tarifa de daños en la devolución:
        if (totalDamage.equals(Money.zero()) && ret.getExtraDamageFee() != null) {
            totalDamage = ret.getExtraDamageFee();
        }

        // 3. Ejecutar fórmula matemática en el Value Object
        return DepositSettlement.calculate(res.getDepositTotal(), totalDamage);
    }

    /**
     * Retorna el comprobante de liquidación formateado como DTO para la API REST y el frontend
     */
    public DepositSettlementResponse getSettlementResponse(Long reservationId) {
        Reservation res = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + reservationId));
        RentalReturn ret = returnRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("La reserva no cuenta con acta de devolución registrada"));

        DepositSettlement settlement = getSettlementByReservationId(reservationId);

        // Obtener nombres amigables de cliente y herramienta (sin lambdas crípticas)
        String clientName = "Cliente #" + res.getClientId();
        if (clientRepository != null) {
            var clientOpt = clientRepository.findById(res.getClientId());
            if (clientOpt.isPresent()) {
                clientName = clientOpt.get().getFirstName() + " " + clientOpt.get().getLastName();
            }
        }

        String toolName = "Herramienta #" + res.getToolId();
        if (toolRepository != null) {
            var toolOpt = toolRepository.findById(res.getToolId());
            if (toolOpt.isPresent()) {
                Tool t = toolOpt.get();
                toolName = t.getName() + " (" + t.getBrand() + ")";
            }
        }

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
