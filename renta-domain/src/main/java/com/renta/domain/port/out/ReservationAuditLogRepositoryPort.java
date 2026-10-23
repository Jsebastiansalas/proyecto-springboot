package com.renta.domain.port.out;

import com.renta.domain.model.entity.ReservationStatusAuditLog;

import java.util.List;

/**
 * Puerto de salida para persistencia y consulta de la pista de auditoría de reservas.
 */
public interface ReservationAuditLogRepositoryPort {

    ReservationStatusAuditLog save(ReservationStatusAuditLog auditLog);

    List<ReservationStatusAuditLog> findByReservationIdOrderByChangedAtDesc(Long reservationId);
}
