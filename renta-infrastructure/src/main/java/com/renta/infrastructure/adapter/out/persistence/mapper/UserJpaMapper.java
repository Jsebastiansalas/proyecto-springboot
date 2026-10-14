package com.renta.infrastructure.adapter.out.persistence.mapper;

import com.renta.domain.model.entity.User;
import com.renta.domain.model.enums.UserRole;
import com.renta.domain.model.vo.Email;
import com.renta.infrastructure.adapter.out.persistence.entity.UserJpaEntity;

public final class UserJpaMapper {

    private UserJpaMapper() {}

    public static User toDomain(UserJpaEntity entity) {
        if (entity == null) return null;
        UserRole role = switch (entity.getRoleId()) {
            case 1 -> UserRole.ROLE_ADMIN;
            case 2 -> UserRole.ROLE_PROVEEDOR;
            default -> UserRole.ROLE_CLIENTE;
        };

        return new User(
                entity.getId(),
                Email.of(entity.getEmail()),
                entity.getPasswordHash(),
                entity.getRoleId(),
                role,
                entity.isActive(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public static UserJpaEntity toJpa(User domain) {
        if (domain == null) return null;
        int roleId = switch (domain.getRole()) {
            case ROLE_ADMIN -> 1;
            case ROLE_PROVEEDOR -> 2;
            case ROLE_CLIENTE -> 3;
        };

        return new UserJpaEntity(
                domain.getId(),
                domain.getEmail() != null ? domain.getEmail().value() : null,
                domain.getPasswordHash(),
                roleId,
                domain.isActive(),
                domain.getCreatedAt(),
                domain.getUpdatedAt()
        );
    }
}
