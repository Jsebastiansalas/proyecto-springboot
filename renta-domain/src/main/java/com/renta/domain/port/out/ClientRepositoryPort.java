package com.renta.domain.port.out;

import com.renta.domain.model.entity.Client;

import java.util.Optional;

/**
 * Outbound repository port for {@link Client} profile persistence.
 */
public interface ClientRepositoryPort {

    Client save(Client client);

    Optional<Client> findById(Long id);

    Optional<Client> findByUserId(Long userId);

    Optional<Client> findByDocumentNumber(String documentNumber);
}
