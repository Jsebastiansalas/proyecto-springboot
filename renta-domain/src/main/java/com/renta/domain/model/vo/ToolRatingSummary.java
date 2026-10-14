package com.renta.domain.model.vo;

import java.util.Objects;

/**
 * Value Object aggregating rating metrics for a tool.
 */
public record ToolRatingSummary(
        Long toolId,
        double averageRating,
        int totalReviews
) {
    public ToolRatingSummary {
        Objects.requireNonNull(toolId, "toolId must not be null");
    }

    public static ToolRatingSummary empty(Long toolId) {
        return new ToolRatingSummary(toolId, 0.0, 0);
    }
}
