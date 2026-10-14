package com.renta.infrastructure.adapter.in.rest;

import com.renta.application.dto.review.CreateReviewRequest;
import com.renta.application.dto.review.ReviewResponse;
import com.renta.application.dto.review.ToolRatingSummaryResponse;
import com.renta.application.service.ReviewApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/reviews")
@Tag(name = "7. Calificaciones y Reseñas", description = "Opiniones, puntuaciones de 1 a 5 estrellas y feedback técnico tras alquileres finalizados")
public class ReviewController {

    private final ReviewApplicationService reviewService;

    public ReviewController(ReviewApplicationService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CLIENTE', 'ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Crear reseña y calificación", description = "Permite a un cliente calificar una herramienta de 1 a 5 estrellas con comentario tras completar su alquiler.")
    public ResponseEntity<ReviewResponse> createReview(@Valid @RequestBody CreateReviewRequest request) {
        ReviewResponse response = reviewService.createReviewFromRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/tool/{toolId}")
    @Operation(summary = "Consultar calificaciones y opiniones de una herramienta", description = "Obtiene el promedio de estrellas (1.0 a 5.0), conteo total de opiniones y el historial de reseñas de la maquinaria.")
    public ResponseEntity<ToolRatingSummaryResponse> getToolReviews(@PathVariable Long toolId) {
        ToolRatingSummaryResponse response = reviewService.getToolRatingSummaryResponse(toolId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/reservation/{reservationId}/status")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Verificar si la reserva ya fue calificada", description = "Indica si la reserva finalizada ya cuenta con una reseña previa.")
    public ResponseEntity<Map<String, Object>> checkReservationReviewStatus(@PathVariable Long reservationId) {
        boolean reviewed = reviewService.getReviewByReservationId(reservationId).isPresent();
        return ResponseEntity.ok(Map.of(
                "reservationId", reservationId,
                "reviewed", reviewed
        ));
    }
}
