package com.renta.infrastructure.adapter.out.persistence;

import com.renta.domain.model.entity.Client;
import com.renta.domain.port.out.ClientRepositoryPort;
import com.renta.infrastructure.adapter.out.persistence.entity.ClientJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.mapper.ClientJpaMapper;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataClientRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class ClientRepositoryAdapter implements ClientRepositoryPort {

    private final SpringDataClientRepository repository;

    public ClientRepositoryAdapter(SpringDataClientRepository repository) {
        this.repository = repository;
    }

    @Override
    public Client save(Client client) {
        ClientJpaEntity entity = ClientJpaMapper.toJpa(client);
        ClientJpaEntity saved = repository.save(entity);
        return ClientJpaMapper.toDomain(saved);
    }

    @Override
    public Optional<Client> findById(Long id) {
        return repository.findById(id).map(ClientJpaMapper::toDomain);
    }

    @Override
    public Optional<Client> findByUserId(Long userId) {
        return repository.findByUserId(userId).map(ClientJpaMapper::toDomain);
    }

    @Override
    public Optional<Client> findByDocumentNumber(String documentNumber) {
        return repository.findByDocumentNumber(documentNumber).map(ClientJpaMapper::toDomain);
    }
}
