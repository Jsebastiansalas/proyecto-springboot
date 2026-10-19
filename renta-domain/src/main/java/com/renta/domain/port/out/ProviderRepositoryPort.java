package com.renta.domain.port.out;

import com.renta.domain.model.entity.Provider;

import java.util.List;
import java.util.Optional;

/**
 * ============================================================================
 * PUERTO DE SALIDA: REPOSITORIO DE PROVEEDORES (ProviderRepositoryPort)
 * ============================================================================
 * 
 * Contrato de persistencia para consultar y gestionar el perfil de empresas y
 * contratistas registrados como proveedores de maquinaria.
 */
public interface ProviderRepositoryPort {

    Provider save(Provider provider);

    Optional<Provider> findById(Long id);

    Optional<Provider> findByUserId(Long userId);

    Optional<Provider> findByNitRut(String nitRut);

    /**
     * Obtiene la lista completa de proveedores para auditoría y verificación.
     */
    List<Provider> findAll();
}
