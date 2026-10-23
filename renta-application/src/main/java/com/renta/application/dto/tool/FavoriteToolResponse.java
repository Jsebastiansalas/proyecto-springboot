package com.renta.application.dto.tool;

import java.math.BigDecimal;

public record FavoriteToolResponse(
        Long toolId,
        String toolName,
        String brand,
        String model,
        BigDecimal baseDailyPrice,
        String mainImageUrl,
        boolean isFavorite
) {}
