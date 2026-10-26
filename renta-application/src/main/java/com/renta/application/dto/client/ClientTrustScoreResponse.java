package com.renta.application.dto.client;

import java.time.Instant;

public record ClientTrustScoreResponse(
        Long clientId,
        String clientName,
        String companyName,
        String documentNumber,
        int score,
        String tier,
        String tierBadgeColor,
        int totalContracts,
        int completedContracts,
        int activeContracts,
        int lateReturns,
        int damageIncidents,
        double punctualityRate,
        int depositDiscountPercent,
        String benefitsDescription,
        String recommendation,
        Instant evaluatedAt
) {}
