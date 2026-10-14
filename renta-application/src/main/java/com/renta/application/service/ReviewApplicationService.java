package com.renta.application.service;

import com.renta.application.dto.review.CreateReviewRequest;
import com.renta.application.dto.review.ReviewResponse;
import com.renta.application.dto.review.ToolRatingSummaryResponse;
import com.renta.domain.exception.BusinessRuleViolationException;
import com.renta.domain.exception.ResourceNotFoundException;
import com.renta.domain.model.entity.Client;
import com.renta.domain.model.entity.Reservation;
import com.renta.domain.model.entity.Review;
import com.renta.domain.model.enums.ReservationStatus;
import com.renta.domain.model.vo.ToolRatingSummary;
import com.renta.domain.port.in.CreateReviewUseCase;
import com.renta.domain.port.in.ReviewQueryUseCase;
import com.renta.domain.port.out.ClientRepositoryPort;
import com.renta.domain.port.out.ReservationRepositoryPort;
import com.renta.domain.port.out.ReviewRepositoryPort;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

public class ReviewApplicationService implements CreateReviewUseCase, ReviewQueryUseCase {

    private final ReviewRepositoryPort reviewRepository;
    private final ReservationRepositoryPort reservationRepository;
    private final ClientRepositoryPort clientRepository;

    public ReviewApplicationService(
            ReviewRepositoryPort reviewRepository,
            ReservationRepositoryPort reservationRepository,
            ClientRepositoryPort clientRepository) {
        this.reviewRepository = Objects.requireNonNull(reviewRepository);
        this.reservationRepository = Objects.requireNonNull(reservationRepository);
        this.clientRepository = Objects.requireNonNull(clientRepository);
    }

    @Override
    public Review createReview(CreateReviewCommand command) {
        Reservation res = reservationRepository.findById(command.reservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + command.reservationId()));

        if (res.getStatus() != ReservationStatus.FINALIZADA) {
            throw new BusinessRuleViolationException("Solo se pueden calificar herramientas tras finalizar y devolver el alquiler (estado actual: " + res.getStatus() + ")");
        }

        if (!Objects.equals(res.getClientId(), command.clientId())) {
            throw new BusinessRuleViolationException("Solo el cliente titular de la reserva puede emitir la calificación");
        }

        if (reviewRepository.findByReservationId(res.getId()).isPresent()) {
            throw new BusinessRuleViolationException("Esta reserva ya cuenta con una reseña y calificación registrada");
        }

        Review review = Review.create(
                res.getToolId(),
                command.clientId(),
                res.getId(),
                command.rating(),
                command.comment()
        );

        return reviewRepository.save(review);
    }

    public ReviewResponse createReviewForUser(Long userId, CreateReviewRequest req) {
        Client client = clientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de cliente no encontrado para el usuario actual"));

        CreateReviewCommand cmd = new CreateReviewCommand(
                null,
                client.getId(),
                req.reservationId(),
                req.rating(),
                req.comment()
        );

        Review saved = createReview(cmd);
        String clientName = client.getFirstName() + " " + client.getLastName();
        return new ReviewResponse(
                saved.getId(),
                saved.getToolId(),
                saved.getClientId(),
                clientName,
                saved.getReservationId(),
                saved.getRating(),
                saved.getComment(),
                saved.getCreatedAt()
        );
    }

    public ReviewResponse createReviewFromRequest(CreateReviewRequest req) {
        Reservation res = reservationRepository.findById(req.reservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + req.reservationId()));

        Long clientId = req.clientId() != null ? req.clientId() : res.getClientId();
        CreateReviewCommand cmd = new CreateReviewCommand(
                res.getToolId(),
                clientId,
                res.getId(),
                req.rating(),
                req.comment()
        );

        Review saved = createReview(cmd);
        String clientName = clientRepository.findById(saved.getClientId())
                .map(c -> c.getFirstName() + " " + c.getLastName())
                .orElse("Cliente #" + saved.getClientId());

        return new ReviewResponse(
                saved.getId(),
                saved.getToolId(),
                saved.getClientId(),
                clientName,
                saved.getReservationId(),
                saved.getRating(),
                saved.getComment(),
                saved.getCreatedAt()
        );
    }

    @Override
    public List<Review> getReviewsByToolId(Long toolId) {
        return reviewRepository.findByToolId(toolId);
    }

    @Override
    public ToolRatingSummary getToolRatingSummary(Long toolId) {
        List<Review> reviews = reviewRepository.findByToolId(toolId);
        if (reviews.isEmpty()) {
            return ToolRatingSummary.empty(toolId);
        }
        double avg = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
        double roundedAvg = BigDecimal.valueOf(avg)
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();
        return new ToolRatingSummary(toolId, roundedAvg, reviews.size());
    }

    @Override
    public Optional<Review> getReviewByReservationId(Long reservationId) {
        return reviewRepository.findByReservationId(reservationId);
    }

    public ToolRatingSummaryResponse getToolRatingSummaryResponse(Long toolId) {
        List<Review> reviews = reviewRepository.findByToolId(toolId);
        if (reviews.isEmpty()) {
            return new ToolRatingSummaryResponse(toolId, 0.0, 0, Collections.emptyList());
        }

        double avg = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
        double roundedAvg = BigDecimal.valueOf(avg)
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();

        List<ReviewResponse> responseList = reviews.stream().map(r -> {
            String clientName = clientRepository.findById(r.getClientId())
                    .map(c -> c.getFirstName() + " " + c.getLastName())
                    .orElse("Cliente #" + r.getClientId());
            return new ReviewResponse(
                    r.getId(),
                    r.getToolId(),
                    r.getClientId(),
                    clientName,
                    r.getReservationId(),
                    r.getRating(),
                    r.getComment(),
                    r.getCreatedAt()
            );
        }).toList();

        return new ToolRatingSummaryResponse(toolId, roundedAvg, reviews.size(), responseList);
    }
}
