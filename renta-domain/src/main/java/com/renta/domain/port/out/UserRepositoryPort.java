package com.renta.domain.port.out;

import com.renta.domain.model.entity.User;
import com.renta.domain.model.vo.Email;

import java.util.Optional;

/**
 * Outbound repository port for {@link User} persistence and lookup.
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
}
