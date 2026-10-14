package com.renta.domain.port.out;

import com.renta.domain.model.entity.Provider;

import java.util.Optional;

/**
 * Outbound repository port for {@link Provider} company profile persistence.
 */
public interface ProviderRepositoryPort {

    Provider save(Provider provider);

    Optional<Provider> findById(Long id);

    Optional<Provider> findByUserId(Long userId);

    Optional<Provider> findByNitRut(String nitRut);
}
