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
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 * ============================================================================
 * SERVICIO DE GESTIÓN DE RESEÑAS Y CALIFICACIONES (1 a 5 ESTRELLAS)
 * ============================================================================
 * 
 * ¿QUÉ HACE ESTE SERVICIO?
 * Permite a los clientes evaluar el rendimiento de los equipos que alquilaron:
 * 1. Validar que la reserva esté FINALIZADA (no se puede calificar antes de usar la máquina).
 * 2. Validar que quien califica sea el titular de la reserva.
 * 3. Impedir calificaciones duplicadas para una misma reserva.
 * 4. Calcular el promedio de estrellas redondeado a 1 decimal (ej. 4.8 / 5.0).
 */
public class ReviewApplicationService implements CreateReviewUseCase, ReviewQueryUseCase {

    private final ReviewRepositoryPort reviewRepository;
    private final ReservationRepositoryPort reservationRepository;
    private final ClientRepositoryPort clientRepository;

    public ReviewApplicationService(
            ReviewRepositoryPort reviewRepository,
            ReservationRepositoryPort reservationRepository,
            ClientRepositoryPort clientRepository) {
        this.reviewRepository = Objects.requireNonNull(reviewRepository, "reviewRepository es obligatorio");
        this.reservationRepository = Objects.requireNonNull(reservationRepository, "reservationRepository es obligatorio");
        this.clientRepository = Objects.requireNonNull(clientRepository, "clientRepository es obligatorio");
    }

    /**
     * CREAR RESEÑA
     * Valida reglas de negocio del contrato antes de registrar la opinión.
     */
    @Override
    public Review createReview(CreateReviewCommand command) {
        // PASO 1: Buscar la reserva asociada
        Reservation res = reservationRepository.findById(command.reservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + command.reservationId()));

        // PASO 2: Validar que el alquiler haya finalizado
        if (res.getStatus() != ReservationStatus.FINALIZADA) {
            throw new BusinessRuleViolationException(
                    "Solo se pueden calificar herramientas tras finalizar y devolver el alquiler (estado actual: " + res.getStatus() + ")");
        }

        // PASO 3: Validar que sea el cliente titular de la reserva
        if (!Objects.equals(res.getClientId(), command.clientId())) {
            throw new BusinessRuleViolationException("Solo el cliente titular de la reserva puede emitir la calificación");
        }

        // PASO 4: Validar que no haya calificado ya previamente
        if (reviewRepository.findByReservationId(res.getId()).isPresent()) {
            throw new BusinessRuleViolationException("Esta reserva ya cuenta con una reseña y calificación registrada");
        }

        // PASO 5: Crear entidad de dominio con sus invariantes (1 a 5 estrellas, comentario min 3 chars)
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
        String clientName = "Cliente #" + saved.getClientId();
        var clientOpt = clientRepository.findById(saved.getClientId());
        if (clientOpt.isPresent()) {
            clientName = clientOpt.get().getFirstName() + " " + clientOpt.get().getLastName();
        }

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
        double roundedAvg = calculateAverageRating(reviews);
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

        double roundedAvg = calculateAverageRating(reviews);

        // Convertir cada reseña a DTO con nombre del cliente usando un bucle for tradicional y legible
        List<ReviewResponse> responseList = new ArrayList<>();
        for (Review r : reviews) {
            String clientName = "Cliente #" + r.getClientId();
            var clientOpt = clientRepository.findById(r.getClientId());
            if (clientOpt.isPresent()) {
                clientName = clientOpt.get().getFirstName() + " " + clientOpt.get().getLastName();
            }

            responseList.add(new ReviewResponse(
                    r.getId(),
                    r.getToolId(),
                    r.getClientId(),
                    clientName,
                    r.getReservationId(),
                    r.getRating(),
                    r.getComment(),
                    r.getCreatedAt()
            ));
        }

        return new ToolRatingSummaryResponse(toolId, roundedAvg, reviews.size(), responseList);
    }

    /**
     * MÉTODO AUXILIAR DIDÁCTICO:
     * Calcula la media aritmética de las estrellas y redondea a 1 decimal.
     */
    private double calculateAverageRating(List<Review> reviews) {
        if (reviews.isEmpty()) return 0.0;
        double sum = 0.0;
        for (Review r : reviews) {
            sum += r.getRating();
        }
        double avg = sum / reviews.size();
        return BigDecimal.valueOf(avg)
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();
    }
}
