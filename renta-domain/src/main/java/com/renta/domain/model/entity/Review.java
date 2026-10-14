package com.renta.domain.model.entity;

import com.renta.domain.exception.BusinessRuleViolationException;

import java.time.Instant;
import java.util.Objects;

/**
 * Domain entity representing a customer review and star rating for a rented tool.
 */
public class Review {
    private Long id;
    private Long toolId;
    private Long clientId;
    private Long reservationId;
    private int rating;
    private String comment;
    private Instant createdAt;

    public Review() {
    }

    public Review(Long id, Long toolId, Long clientId, Long reservationId, int rating, String comment, Instant createdAt) {
        validateRating(rating);
        validateComment(comment);
        this.id = id;
        this.toolId = Objects.requireNonNull(toolId, "toolId no puede ser nulo");
        this.clientId = Objects.requireNonNull(clientId, "clientId no puede ser nulo");
        this.reservationId = Objects.requireNonNull(reservationId, "reservationId no puede ser nulo");
        this.rating = rating;
        this.comment = comment.trim();
        this.createdAt = createdAt != null ? createdAt : Instant.now();
    }

    public static Review create(Long toolId, Long clientId, Long reservationId, int rating, String comment) {
        return new Review(null, toolId, clientId, reservationId, rating, comment, Instant.now());
    }

    private void validateRating(int rating) {
        if (rating < 1 || rating > 5) {
            throw new BusinessRuleViolationException("La calificación debe estar entre 1 y 5 estrellas");
        }
    }

    private void validateComment(String comment) {
        if (comment == null || comment.trim().length() < 3) {
            throw new BusinessRuleViolationException("El comentario de la reseña debe contener al menos 3 caracteres");
        }
        if (comment.length() > 1000) {
            throw new BusinessRuleViolationException("El comentario no puede superar los 1000 caracteres");
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getToolId() {
        return toolId;
    }

    public void setToolId(Long toolId) {
        this.toolId = toolId;
    }

    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public Long getReservationId() {
        return reservationId;
    }

    public void setReservationId(Long reservationId) {
        this.reservationId = reservationId;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        validateRating(rating);
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        validateComment(comment);
        this.comment = comment != null ? comment.trim() : null;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Review review)) return false;
        return Objects.equals(id, review.id) || Objects.equals(reservationId, review.reservationId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, reservationId);
    }

    @Override
    public String toString() {
        return "Review{" +
                "id=" + id +
                ", toolId=" + toolId +
                ", clientId=" + clientId +
                ", reservationId=" + reservationId +
                ", rating=" + rating +
                '}';
    }
}
