package com.renta.infrastructure.adapter.out.persistence.mapper;

import com.renta.domain.model.entity.Review;
import com.renta.infrastructure.adapter.out.persistence.entity.ReviewJpaEntity;

public final class ReviewJpaMapper {

    private ReviewJpaMapper() {}

    public static Review toDomain(ReviewJpaEntity entity) {
        if (entity == null) return null;
        return new Review(
                entity.getId(),
                entity.getToolId(),
                entity.getClientId(),
                entity.getReservationId(),
                entity.getRating(),
                entity.getComment(),
                entity.getCreatedAt()
        );
    }

    public static ReviewJpaEntity toJpa(Review domain) {
        if (domain == null) return null;
        return new ReviewJpaEntity(
                domain.getId(),
                domain.getToolId(),
                domain.getClientId(),
                domain.getReservationId(),
                domain.getRating(),
                domain.getComment(),
                domain.getCreatedAt()
        );
    }
}
