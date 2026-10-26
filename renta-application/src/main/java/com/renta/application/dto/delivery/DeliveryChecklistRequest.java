package com.renta.application.dto.delivery;

public record DeliveryChecklistRequest(
        Long deliveryId,
        boolean cablesInspected,
        boolean safetyGuardsOk,
        boolean retieCertified,
        boolean fluidsLevelOk,
        boolean operatorPpeKitIncluded,
        String inspectorSignature
) {}
