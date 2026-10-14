package com.renta.infrastructure.adapter.out.persistence;

import com.renta.domain.model.entity.Review;
import com.renta.domain.port.out.ReviewRepositoryPort;
import com.renta.infrastructure.adapter.out.persistence.entity.ReviewJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.mapper.ReviewJpaMapper;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataReviewRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class ReviewRepositoryAdapter implements ReviewRepositoryPort {

    private final SpringDataReviewRepository repository;

    public ReviewRepositoryAdapter(SpringDataReviewRepository repository) {
        this.repository = repository;
    }

    @Override
    public Review save(Review review) {
        ReviewJpaEntity entity = ReviewJpaMapper.toJpa(review);
        ReviewJpaEntity saved = repository.save(entity);
        return ReviewJpaMapper.toDomain(saved);
    }

    @Override
    public Optional<Review> findById(Long id) {
        return repository.findById(id).map(ReviewJpaMapper::toDomain);
    }

    @Override
    public Optional<Review> findByReservationId(Long reservationId) {
        return repository.findByReservationId(reservationId).map(ReviewJpaMapper::toDomain);
    }

    @Override
    public List<Review> findByToolId(Long toolId) {
        return repository.findByToolIdOrderByCreatedAtDesc(toolId).stream()
                .map(ReviewJpaMapper::toDomain)
                .toList();
    }

    @Override
    public List<Review> findByClientId(Long clientId) {
        return repository.findByClientIdOrderByCreatedAtDesc(clientId).stream()
                .map(ReviewJpaMapper::toDomain)
                .toList();
    }
}
