package com.renta.application.dto.reservation;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO Inmutable de respuesta con el desglose de la prórroga concedida.
 */
public record ReservationExtensionResponse(
        Long reservationId,
        String reservationCode,
        LocalDate originalEndDate,
        LocalDate newEndDate,
        int additionalDays,
        int totalDaysUpdated,
        BigDecimal additionalCost,
        BigDecimal additionalTaxIva,
        BigDecimal newSubtotal,
        BigDecimal newTotalAmount,
        String status,
        String extensionReason,
        String message
) {
}
