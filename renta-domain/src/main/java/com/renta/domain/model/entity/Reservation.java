package com.renta.domain.model.entity;

import com.renta.domain.exception.BusinessRuleViolationException;
import com.renta.domain.exception.ToolNotAvailableException;
import com.renta.domain.model.enums.ReservationStatus;
import com.renta.domain.model.enums.ToolStatus;
import com.renta.domain.model.vo.DateRange;
import com.renta.domain.model.vo.Money;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;

/**
 * ============================================================================
 * RAÍZ DE AGREGADO (AGGREGATE ROOT): CONTRATO DE RESERVA (Reservation)
 * ============================================================================
 * 
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Es el corazón transaccional del negocio. Modela el contrato de alquiler:
 * 1. Mantiene el código único de seguimiento legal (`RES-YYYY-XXXXXX`).
 * 2. Encapsula el intervalo de fechas inmutable mediante {@link DateRange}.
 * 3. Gestiona la MÁQUINA DE ESTADOS del contrato:
 *    - `PENDIENTE` $\rightarrow$ Solicitada por el cliente.
 *    - `APROBADA` / `RECHAZADA` $\rightarrow$ Decisión del proveedor.
 *    - `PAGADA` $\rightarrow$ Confirmación de fondos en pasarela.
 *    - `EN_CURSO` $\rightarrow$ Maquinaria despachada y en obra.
 *    - `FINALIZADA` $\rightarrow$ Maquinaria recibida e inspeccionada en bodega.
 *    - `CANCELADA` $\rightarrow$ Anulada antes de su inicio.
 * 4. Protege los invariantes monetarios (subtotal, depósito de fianza y total).
 */
public class Reservation {
    private Long id;
    private String reservationCode;
    private Long clientId;
    private Long toolId;
    private DateRange dateRange;
    private int totalDays;
    private Money subtotal;
    private Money depositTotal;
    private Money totalAmount;
    private ReservationStatus status = ReservationStatus.PENDIENTE;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;

    public Reservation() {
    }

    public Reservation(Long id, String reservationCode, Long clientId, Long toolId,
                       DateRange dateRange, int totalDays, Money subtotal,
                       Money depositTotal, Money totalAmount, ReservationStatus status,
                       String notes, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.reservationCode = reservationCode;
        this.clientId = clientId;
        this.toolId = toolId;
        this.dateRange = dateRange;
        this.totalDays = totalDays;
        this.subtotal = subtotal;
        this.depositTotal = depositTotal;
        this.totalAmount = totalAmount;
        this.status = status != null ? status : ReservationStatus.PENDIENTE;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    /**
     * Factory method creating a new Reservation with domain validation.
     * Guards against reserving tools that are in MANTENIMIENTO, RETIRADA, or otherwise unavailable.
     */
    public static Reservation create(String reservationCode, Long clientId, Tool tool,
                                      DateRange dateRange, Money subtotal, Money depositTotal, String notes) {
        Objects.requireNonNull(tool, "La herramienta a reservar no puede ser nula");
        Objects.requireNonNull(dateRange, "El rango de fechas no puede ser nulo");
        Objects.requireNonNull(subtotal, "El subtotal no puede ser nulo");

        // Availability Guardrail: check tool status
        if (tool.getStatus() == ToolStatus.MANTENIMIENTO || tool.isInMaintenance()) {
            throw new ToolNotAvailableException(
                    tool.getId(),
                    "La herramienta se encuentra en MANTENIMIENTO y no puede ser reservada."
            );
        }
        if (!tool.isAvailable()) {
            throw new ToolNotAvailableException(
                    tool.getId(),
                    String.format("La herramienta no está disponible para reserva (estado actual: %s).", tool.getStatus())
            );
        }

        Money deposit = depositTotal != null ? depositTotal : Money.zero();
        Money total = subtotal.plus(deposit);
        Instant now = Instant.now();

        return new Reservation(
                null,
                reservationCode,
                clientId,
                tool.getId(),
                dateRange,
                dateRange.durationInDays(),
                subtotal,
                deposit,
                total,
                ReservationStatus.PENDIENTE,
                notes,
                now,
                now
        );
    }

    // State Machine Transitions

    /**
     * Approves a pending reservation (PENDIENTE -> APROBADA).
     */
    public void approve() {
        if (this.status != ReservationStatus.PENDIENTE) {
            throw new BusinessRuleViolationException(
                    String.format("Transición de estado inválida: no se puede aprobar una reserva en estado %s", this.status)
            );
        }
        this.status = ReservationStatus.APROBADA;
        this.updatedAt = Instant.now();
    }

    /**
     * Starts the active rental period when the tool is delivered (APROBADA -> EN_CURSO).
     */
    public void startRental() {
        if (this.status != ReservationStatus.APROBADA) {
            throw new BusinessRuleViolationException(
                    String.format("Transición de estado inválida: la reserva debe estar APROBADA para iniciar el alquiler. Estado actual: %s", this.status)
            );
        }
        this.status = ReservationStatus.EN_CURSO;
        this.updatedAt = Instant.now();
    }

    /**
     * Concludes the rental period when the tool is returned and inspected (EN_CURSO -> FINALIZADA).
     */
    public void finishRental() {
        if (this.status != ReservationStatus.EN_CURSO) {
            throw new BusinessRuleViolationException(
                    String.format("Transición de estado inválida: no se puede finalizar una reserva en estado %s. Debe estar EN_CURSO.", this.status)
            );
        }
        this.status = ReservationStatus.FINALIZADA;
        this.updatedAt = Instant.now();
    }

    /**
     * Alias for {@link #finishRental()}.
     */
    public void finalizeRental() {
        finishRental();
    }

    /**
     * Cancels the reservation prior to delivery (PENDIENTE / APROBADA -> CANCELADA).
     */
    public void cancel(String reason) {
        if (this.status.isTerminal()) {
            throw new BusinessRuleViolationException(
                    String.format("Transición de estado inválida: la reserva ya está en estado terminal %s y no puede cancelarse.", this.status)
            );
        }
        if (this.status == ReservationStatus.EN_CURSO) {
            throw new BusinessRuleViolationException(
                    "Transición de estado inválida: no se puede cancelar una reserva que ya se encuentra EN_CURSO. Debe realizarse el retorno formal."
            );
        }
        if (this.status != ReservationStatus.PENDIENTE && this.status != ReservationStatus.APROBADA) {
            throw new BusinessRuleViolationException(
                    String.format("Transición de estado inválida de %s a CANCELADA", this.status)
            );
        }
        this.status = ReservationStatus.CANCELADA;
        if (reason != null && !reason.trim().isEmpty()) {
            this.notes = (this.notes != null ? this.notes + " | " : "") + "Cancelación: " + reason;
        }
        this.updatedAt = Instant.now();
    }

    /**
     * Rejects the reservation when pending (PENDIENTE -> RECHAZADA).
     */
    public void reject(String reason) {
        if (this.status != ReservationStatus.PENDIENTE) {
            throw new BusinessRuleViolationException(
                    String.format("Transición de estado inválida: solo se puede rechazar una reserva en estado PENDIENTE. Estado actual: %s", this.status)
            );
        }
        this.status = ReservationStatus.RECHAZADA;
        if (reason != null && !reason.trim().isEmpty()) {
            this.notes = (this.notes != null ? this.notes + " | " : "") + "Rechazo: " + reason;
        }
        this.updatedAt = Instant.now();
    }

    /**
     * Attempts a generic transition to the requested target status.
     * Enforces domain state machine transition invariants.
     */
    public void transitionTo(ReservationStatus targetStatus) {
        Objects.requireNonNull(targetStatus, "El estado destino no puede ser nulo");
        if (this.status.isTerminal()) {
            throw new BusinessRuleViolationException(
                    String.format("No se pueden realizar transiciones desde un estado terminal (%s).", this.status)
            );
        }
        if (!this.status.canTransitionTo(targetStatus)) {
            throw new BusinessRuleViolationException(
                    String.format("Transición de estado inválida: %s -> %s no permitida por las reglas del negocio.", this.status, targetStatus)
            );
        }
        switch (targetStatus) {
            case APROBADA -> approve();
            case EN_CURSO -> startRental();
            case FINALIZADA -> finishRental();
            case CANCELADA -> cancel("Cambio de estado directo");
            case RECHAZADA -> reject("Cambio de estado directo");
            case PENDIENTE -> throw new BusinessRuleViolationException("No se permite regresar una reserva al estado PENDIENTE.");
        }
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReservationCode() {
        return reservationCode;
    }

    public void setReservationCode(String reservationCode) {
        this.reservationCode = reservationCode;
    }

    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public Long getToolId() {
        return toolId;
    }

    public void setToolId(Long toolId) {
        this.toolId = toolId;
    }

    public DateRange getDateRange() {
        return dateRange;
    }

    public void setDateRange(DateRange dateRange) {
        this.dateRange = dateRange;
        if (dateRange != null) {
            this.totalDays = dateRange.durationInDays();
        }
    }

    public LocalDate getStartDate() {
        return dateRange != null ? dateRange.startDate() : null;
    }

    public LocalDate getEndDate() {
        return dateRange != null ? dateRange.endDate() : null;
    }

    public int getTotalDays() {
        return totalDays;
    }

    public void setTotalDays(int totalDays) {
        this.totalDays = totalDays;
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

    public Money getDepositTotal() {
        return depositTotal;
    }

    public void setDepositTotal(Money depositTotal) {
        this.depositTotal = depositTotal;
    }

    public void setDepositTotal(BigDecimal depositTotal) {
        this.depositTotal = depositTotal != null ? Money.cop(depositTotal) : Money.zero();
    }

    public Money getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Money totalAmount) {
        this.totalAmount = totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount != null ? Money.cop(totalAmount) : null;
    }

    public ReservationStatus getStatus() {
        return status;
    }

    public void setStatus(ReservationStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Reservation that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Reservation{" + "id=" + id + ", code='" + reservationCode + '\'' + ", status=" + status + ", range=" + dateRange + '}';
    }
}
