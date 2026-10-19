package com.renta.infrastructure.adapter.out.persistence;

import com.renta.domain.model.entity.Provider;
import com.renta.domain.port.out.ProviderRepositoryPort;
import com.renta.infrastructure.adapter.out.persistence.entity.ProviderJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.mapper.ProviderJpaMapper;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataProviderRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class ProviderRepositoryAdapter implements ProviderRepositoryPort {

    private final SpringDataProviderRepository repository;

    public ProviderRepositoryAdapter(SpringDataProviderRepository repository) {
        this.repository = repository;
    }

    @Override
    public Provider save(Provider provider) {
        ProviderJpaEntity entity = ProviderJpaMapper.toJpa(provider);
        ProviderJpaEntity saved = repository.save(entity);
        return ProviderJpaMapper.toDomain(saved);
    }

    @Override
    public Optional<Provider> findById(Long id) {
        return repository.findById(id).map(ProviderJpaMapper::toDomain);
    }

    @Override
    public Optional<Provider> findByUserId(Long userId) {
        return repository.findByUserId(userId).map(ProviderJpaMapper::toDomain);
    }

    @Override
    public Optional<Provider> findByNitRut(String nitRut) {
        return repository.findByNitRut(nitRut).map(ProviderJpaMapper::toDomain);
    }

    /**
     * Recupera todos los proveedores registrados en la base de datos.
     */
    @Override
    public java.util.List<Provider> findAll() {
        return repository.findAll().stream()
                .map(ProviderJpaMapper::toDomain)
                .toList();
    }
}
