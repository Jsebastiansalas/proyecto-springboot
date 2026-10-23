package com.renta.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "client_favorite_tools")
public class ClientFavoriteJpaEntity {

    @EmbeddedId
    private ClientFavoriteId id;

    @Column(name = "added_at")
    private Instant addedAt;

    public ClientFavoriteJpaEntity() {
    }

    public ClientFavoriteJpaEntity(ClientFavoriteId id, Instant addedAt) {
        this.id = id;
        this.addedAt = addedAt != null ? addedAt : Instant.now();
    }

    public ClientFavoriteId getId() {
        return id;
    }

    public void setId(ClientFavoriteId id) {
        this.id = id;
    }

    public Instant getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(Instant addedAt) {
        this.addedAt = addedAt;
    }
}
