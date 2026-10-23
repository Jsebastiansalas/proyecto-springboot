package com.renta.infrastructure.adapter.out.persistence;

import com.renta.domain.port.out.ClientFavoriteToolRepositoryPort;
import com.renta.infrastructure.adapter.out.persistence.entity.ClientFavoriteId;
import com.renta.infrastructure.adapter.out.persistence.entity.ClientFavoriteJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataClientFavoriteRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Component
public class ClientFavoriteRepositoryAdapter implements ClientFavoriteToolRepositoryPort {

    private final SpringDataClientFavoriteRepository repository;

    public ClientFavoriteRepositoryAdapter(SpringDataClientFavoriteRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public void addFavorite(Long clientId, Long toolId) {
        ClientFavoriteId id = new ClientFavoriteId(clientId, toolId);
        if (!repository.existsById(id)) {
            repository.save(new ClientFavoriteJpaEntity(id, Instant.now()));
        }
    }

    @Override
    @Transactional
    public void removeFavorite(Long clientId, Long toolId) {
        ClientFavoriteId id = new ClientFavoriteId(clientId, toolId);
        repository.deleteById(id);
    }

    @Override
    public boolean isFavorite(Long clientId, Long toolId) {
        return repository.existsById(new ClientFavoriteId(clientId, toolId));
    }

    @Override
    public List<Long> findFavoriteToolIdsByClientId(Long clientId) {
        return repository.findFavoriteToolIdsByClientId(clientId);
    }
}
