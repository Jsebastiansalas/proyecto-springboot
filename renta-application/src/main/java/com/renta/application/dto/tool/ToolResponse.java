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
        Instant createdAt,
        Double averageRating,
        Long totalReviews
) {
    public ToolResponse(Long id, Long providerId, String providerName, Integer categoryId, String categoryName,
                        String codeSku, String name, String brand, String model, String description,
                        BigDecimal baseDailyPrice, BigDecimal depositAmount, ToolStatus status,
                        String mainImageUrl, Instant createdAt) {
        this(id, providerId, providerName, categoryId, categoryName, codeSku, name, brand, model, description,
                baseDailyPrice, depositAmount, status, mainImageUrl, createdAt, 5.0, 0L);
    }
}
