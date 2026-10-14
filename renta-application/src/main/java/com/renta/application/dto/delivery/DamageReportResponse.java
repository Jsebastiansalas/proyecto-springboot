package com.renta.application.dto.delivery;

import com.renta.domain.model.enums.DamageReportStatus;
import com.renta.domain.model.enums.DamageType;

import java.math.BigDecimal;
import java.time.Instant;

public record DamageReportResponse(
        Long id,
        Long returnId,
        String reportedBy,
        DamageType damageType,
        String description,
        BigDecimal repairCostEstimate,
        DamageReportStatus status,
        Instant createdAt
) {}
