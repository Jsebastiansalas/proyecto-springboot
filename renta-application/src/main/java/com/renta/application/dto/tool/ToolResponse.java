package com.renta.application.dto.tool;

import com.renta.domain.model.enums.ToolStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record ToolResponse(
        Long id,
        Long providerId,
        String providerName,
        Integer categoryId,
        String categoryName,
        String codeSku,
        String name,
        String brand,
        String model,
        String description,
        BigDecimal baseDailyPrice,
        BigDecimal depositAmount,
        ToolStatus status,
        String mainImageUrl,
        Instant createdAt
) {}
