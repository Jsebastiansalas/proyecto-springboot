package com.renta.application.dto.report;

import java.math.BigDecimal;

/**
 * ============================================================================
 * DTO: CLIENTE FRECUENTE (FrequentClientDto) - SPRINT 2 (HU-05)
 * ============================================================================
 * Representa las métricas de un cliente en el ranking de frecuencia de alquileres.
 */
public record FrequentClientDto(
        Long clientId,
        String clientName,
        String email,
        String documentNumber,
        long totalReservations,
        BigDecimal totalSpent
) {}
