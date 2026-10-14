package com.renta.application.dto.review;

import java.util.List;

public record ToolRatingSummaryResponse(
        Long toolId,
        Double averageRating,
        Integer totalReviews,
        List<ReviewResponse> reviews
) {}
