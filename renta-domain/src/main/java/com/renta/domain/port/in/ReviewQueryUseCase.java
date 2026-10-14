package com.renta.domain.port.in;

import com.renta.domain.model.entity.Review;
import com.renta.domain.model.vo.ToolRatingSummary;

import java.util.List;
import java.util.Optional;

/**
 * Inbound port for querying tool reviews and ratings.
 */
public interface ReviewQueryUseCase {
    List<Review> getReviewsByToolId(Long toolId);
    ToolRatingSummary getToolRatingSummary(Long toolId);
    Optional<Review> getReviewByReservationId(Long reservationId);
}
