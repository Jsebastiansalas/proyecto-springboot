package com.renta.infrastructure.adapter.out.persistence;

import com.renta.domain.model.entity.User;
import com.renta.domain.model.vo.Email;
import com.renta.domain.port.out.UserRepositoryPort;
import com.renta.infrastructure.adapter.out.persistence.entity.UserJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.mapper.UserJpaMapper;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataUserRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class UserRepositoryAdapter implements UserRepositoryPort {

    private final SpringDataUserRepository repository;

    public UserRepositoryAdapter(SpringDataUserRepository repository) {
        this.repository = repository;
    }

    @Override
    public User save(User user) {
        UserJpaEntity entity = UserJpaMapper.toJpa(user);
        UserJpaEntity saved = repository.save(entity);
        return UserJpaMapper.toDomain(saved);
    }

    @Override
    public Optional<User> findById(Long id) {
        return repository.findById(id).map(UserJpaMapper::toDomain);
    }

    @Override
    public Optional<User> findByEmail(Email email) {
        if (email == null) return Optional.empty();
        return repository.findByEmail(email.value()).map(UserJpaMapper::toDomain);
    }

    @Override
    public boolean existsByEmail(Email email) {
        return email != null && repository.existsByEmail(email.value());
    }
}
