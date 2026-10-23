package com.renta.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ClientFavoriteId implements Serializable {

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "tool_id", nullable = false)
    private Long toolId;

    public ClientFavoriteId() {
    }

    public ClientFavoriteId(Long clientId, Long toolId) {
        this.clientId = clientId;
        this.toolId = toolId;
    }

    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public Long getToolId() {
        return toolId;
    }

    public void setToolId(Long toolId) {
        this.toolId = toolId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ClientFavoriteId that = (ClientFavoriteId) o;
        return Objects.equals(clientId, that.clientId) && Objects.equals(toolId, that.toolId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(clientId, toolId);
    }
}
