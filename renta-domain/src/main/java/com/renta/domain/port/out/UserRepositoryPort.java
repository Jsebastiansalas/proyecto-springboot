package com.renta.domain.port.out;

import com.renta.domain.model.entity.User;
import com.renta.domain.model.vo.Email;

import java.util.List;
import java.util.Optional;

/**
 * ============================================================================
 * PUERTO DE SALIDA: REPOSITORIO DE USUARIOS (UserRepositoryPort)
 * ============================================================================
 * 
 * Define las operaciones que el dominio necesita realizar sobre los usuarios,
 * sin importar si los datos se guardan en PostgreSQL, MySQL o memoria.
 */
public interface UserRepositoryPort {

    User save(User user);

    Optional<User> findById(Long id);

    Optional<User> findByEmail(Email email);

    default Optional<User> findByEmail(String email) {
        return email != null ? findByEmail(Email.of(email)) : Optional.empty();
    }

    boolean existsByEmail(Email email);

    default boolean existsByEmail(String email) {
        return email != null && existsByEmail(Email.of(email));
    }

    /**
     * Obtiene la lista completa de todos los usuarios registrados.
     * Útil para la administración y auditoría del sistema.
     */
    List<User> findAll();
}
