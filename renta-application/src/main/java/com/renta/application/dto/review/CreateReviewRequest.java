package com.renta.application.dto.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateReviewRequest(
        @NotNull(message = "El ID de la reserva es obligatorio")
        Long reservationId,

        @NotNull(message = "La calificación es obligatoria")
        @Min(value = 1, message = "La calificación mínima es 1 estrella")
        @Max(value = 5, message = "La calificación máxima es 5 estrellas")
        Integer rating,

        @NotBlank(message = "El comentario no puede estar vacío")
        @Size(min = 3, max = 1000, message = "El comentario debe tener entre 3 y 1000 caracteres")
        String comment,

        Long clientId
) {
    public CreateReviewRequest(Long reservationId, Integer rating, String comment) {
        this(reservationId, rating, comment, null);
    }
}
