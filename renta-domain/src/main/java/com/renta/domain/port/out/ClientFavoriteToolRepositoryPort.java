package com.renta.domain.port.out;

import java.util.List;

/**
 * Puerto de salida para gestión de la lista de herramientas favoritas / deseos del cliente.
 */
public interface ClientFavoriteToolRepositoryPort {

    void addFavorite(Long clientId, Long toolId);

    void removeFavorite(Long clientId, Long toolId);

    boolean isFavorite(Long clientId, Long toolId);

    List<Long> findFavoriteToolIdsByClientId(Long clientId);
}
