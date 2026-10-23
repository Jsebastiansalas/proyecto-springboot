package com.renta.domain.port.in;

import com.renta.domain.model.entity.Reservation;

import java.time.LocalDate;

/**
 * ============================================================================
 * PUERTO DE ENTRADA: EXTENSIÓN / PRÓRROGA DE CONTRATO DE RESERVA
 * ============================================================================
 * Define el contrato de caso de uso para extender la fecha de finalización
 * de un alquiler activo sin acoplamiento a frameworks de infraestructura.
 */
public interface ExtendReservationUseCase {

    /**
     * Extiende la fecha final de una reserva activa previa validación de
     * disponibilidad de la herramienta en el nuevo periodo extendido.
     *
     * @param reservationId ID de la reserva a extender.
     * @param newEndDate    Nueva fecha de devolución requerida (debe ser posterior a la actual).
     * @param reason        Motivo de la prórroga (ej. retraso de obra, lluvia).
     * @return Contrato de reserva actualizado con los nuevos totales financieros.
     */
    Reservation extendReservation(Long reservationId, LocalDate newEndDate, String reason);
}
