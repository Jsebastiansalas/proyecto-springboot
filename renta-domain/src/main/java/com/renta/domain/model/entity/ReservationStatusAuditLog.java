package com.renta.domain.model.entity;

import com.renta.domain.model.enums.ReservationStatus;

import java.time.Instant;
import java.util.Objects;

/**
 * Entidad de dominio que representa una entrada en la pista de auditoría de transiciones de reserva.
 */
public class ReservationStatusAuditLog {
    private Long id;
    private Long reservationId;
    private ReservationStatus previousStatus;
    private ReservationStatus newStatus;
    private String changedBy;
    private Instant changedAt;
    private String reason;

    public ReservationStatusAuditLog() {
    }

    public ReservationStatusAuditLog(
            Long id,
            Long reservationId,
            ReservationStatus previousStatus,
            ReservationStatus newStatus,
            String changedBy,
            Instant changedAt,
            String reason) {
        this.id = id;
        this.reservationId = Objects.requireNonNull(reservationId, "reservationId no puede ser nulo");
        this.newStatus = Objects.requireNonNull(newStatus, "newStatus no puede ser nulo");
        this.previousStatus = previousStatus;
        this.changedBy = changedBy != null ? changedBy : "SYSTEM";
        this.changedAt = changedAt != null ? changedAt : Instant.now();
        this.reason = reason;
    }

    public static ReservationStatusAuditLog create(
            Long reservationId,
            ReservationStatus previousStatus,
            ReservationStatus newStatus,
            String changedBy,
            String reason) {
        return new ReservationStatusAuditLog(null, reservationId, previousStatus, newStatus, changedBy, Instant.now(), reason);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getReservationId() {
        return reservationId;
    }

    public void setReservationId(Long reservationId) {
        this.reservationId = reservationId;
    }

    public ReservationStatus getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(ReservationStatus previousStatus) {
        this.previousStatus = previousStatus;
    }

    public ReservationStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(ReservationStatus newStatus) {
        this.newStatus = newStatus;
    }

    public String getChangedBy() {
        return changedBy;
    }

    public void setChangedBy(String changedBy) {
        this.changedBy = changedBy;
    }

    public Instant getChangedAt() {
        return changedAt;
    }

    public void setChangedAt(Instant changedAt) {
        this.changedAt = changedAt;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
