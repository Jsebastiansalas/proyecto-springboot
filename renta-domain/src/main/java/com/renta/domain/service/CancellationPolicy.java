package com.renta.domain.service;

import com.renta.domain.model.entity.Reservation;
import com.renta.domain.model.vo.CancellationSettlement;
import com.renta.domain.model.vo.Money;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * ============================================================================
 * SERVICIO DE DOMINIO: POLÍTICA FINANCIERA DE CANCELACIÓN Y PENALIZACIÓN
 * ============================================================================
 * Calcula las penalizaciones y reembolsos de fianza según la anticipación:
 * - Cancelación con más de 48h de antelación: 0% penalización (100% reembolso).
 * - Cancelación entre 24h y 48h antes: 20% penalización sobre el subtotal.
 * - Cancelación con menos de 24h: 50% penalización sobre el subtotal.
 * El depósito de fianza (depositTotal) SIEMPRE se reembolsa al 100% al no haberse entregado la máquina.
 */
public class CancellationPolicy {

    public static CancellationSettlement evaluate(Reservation reservation, LocalDateTime cancellationTime) {
        LocalDate startDate = reservation.getDateRange().startDate();
        LocalDateTime reservationStart = startDate.atTime(8, 0); // Asume inicio a las 8:00 AM

        long hoursBefore = ChronoUnit.HOURS.between(cancellationTime, reservationStart);

        BigDecimal penaltyRate;
        String tierDescription;

        if (hoursBefore >= 48) {
            penaltyRate = BigDecimal.ZERO;
            tierDescription = "Cancelación anticipada (>48h): Reembolso total sin penalización.";
        } else if (hoursBefore >= 24) {
            penaltyRate = BigDecimal.valueOf(0.20); // 20%
            tierDescription = "Cancelación intermedia (24h - 48h): Se aplica 20% de penalización sobre el alquiler.";
        } else {
            penaltyRate = BigDecimal.valueOf(0.50); // 50%
            tierDescription = "Cancelación tardía (<24h): Se aplica 50% de penalización por reserva de flota.";
        }

        Money subtotal = reservation.getSubtotal();
        Money deposit = reservation.getDepositTotal();

        Money penaltyAmount = Money.of(subtotal.amount().multiply(penaltyRate));
        Money refundedSubtotal = subtotal.minus(penaltyAmount);
        Money totalRefunded = refundedSubtotal.plus(deposit);

        return new CancellationSettlement(
                reservation.getId(),
                reservation.getTotalAmount(),
                subtotal,
                deposit,
                penaltyRate.multiply(BigDecimal.valueOf(100)),
                penaltyAmount,
                totalRefunded,
                tierDescription
        );
    }
}
