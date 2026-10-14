package com.renta.domain.port.in;

import com.renta.domain.model.entity.Review;

/**
 * Inbound port for creating tool reviews.
 */
public interface CreateReviewUseCase {
    record CreateReviewCommand(
            Long toolId,
            Long clientId,
            Long reservationId,
            int rating,
            String comment
    ) {}

    Review createReview(CreateReviewCommand command);
}
