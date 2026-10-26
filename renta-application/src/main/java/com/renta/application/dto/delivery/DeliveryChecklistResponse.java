package com.renta.application.dto.delivery;

import java.time.Instant;

public record DeliveryChecklistResponse(
        Long id,
        Long deliveryId,
        boolean cablesInspected,
        boolean safetyGuardsOk,
        boolean retieCertified,
        boolean fluidsLevelOk,
        boolean operatorPpeKitIncluded,
        String inspectorSignature,
        boolean fullyCompliant,
        Instant createdAt
) {}
