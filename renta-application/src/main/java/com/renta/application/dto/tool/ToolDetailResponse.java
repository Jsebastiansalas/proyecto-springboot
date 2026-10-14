package com.renta.application.dto.tool;

import com.renta.domain.model.enums.ToolStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record ToolDetailResponse(
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
        Instant createdAt,
        List<ToolImageDto> images,
        List<ToolSpecificationDto> specifications,
        List<ToolPricingTierDto> pricingTiers,
        List<ToolSafetyRequirementDto> safetyRequirements
) {}
