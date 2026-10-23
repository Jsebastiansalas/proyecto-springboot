package com.renta.application.service;

import com.renta.application.dto.tool.FavoriteToolResponse;
import com.renta.domain.exception.ResourceNotFoundException;
import com.renta.domain.model.entity.Tool;
import com.renta.domain.port.out.ClientFavoriteToolRepositoryPort;
import com.renta.domain.port.out.ClientRepositoryPort;
import com.renta.domain.port.out.ToolRepositoryPort;

import java.util.List;
import java.util.Objects;

public class ClientFavoriteApplicationService {

    private final ClientFavoriteToolRepositoryPort favoriteRepository;
    private final ToolRepositoryPort toolRepository;
    private final ClientRepositoryPort clientRepository;

    public ClientFavoriteApplicationService(
            ClientFavoriteToolRepositoryPort favoriteRepository,
            ToolRepositoryPort toolRepository,
            ClientRepositoryPort clientRepository) {
        this.favoriteRepository = Objects.requireNonNull(favoriteRepository, "favoriteRepository no puede ser nulo");
        this.toolRepository = Objects.requireNonNull(toolRepository, "toolRepository no puede ser nulo");
        this.clientRepository = Objects.requireNonNull(clientRepository, "clientRepository no puede ser nulo");
    }

    public void addFavorite(Long clientId, Long toolId) {
        toolRepository.findById(toolId)
                .orElseThrow(() -> new ResourceNotFoundException("Herramienta no encontrada con ID: " + toolId));
        clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con ID: " + clientId));

        favoriteRepository.addFavorite(clientId, toolId);
    }

    public void removeFavorite(Long clientId, Long toolId) {
        favoriteRepository.removeFavorite(clientId, toolId);
    }

    public boolean isFavorite(Long clientId, Long toolId) {
        return favoriteRepository.isFavorite(clientId, toolId);
    }

    public List<FavoriteToolResponse> getClientFavorites(Long clientId) {
        clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con ID: " + clientId));

        List<Long> favoriteIds = favoriteRepository.findFavoriteToolIdsByClientId(clientId);
        return favoriteIds.stream()
                .map(id -> toolRepository.findById(id).orElse(null))
                .filter(Objects::nonNull)
                .map(tool -> new FavoriteToolResponse(
                        tool.getId(),
                        tool.getName(),
                        tool.getBrand(),
                        tool.getModel(),
                        tool.getBaseDailyPrice() != null ? tool.getBaseDailyPrice().amount() : null,
                        tool.getMainImageUrl(),
                        true
                ))
                .toList();
    }
}
