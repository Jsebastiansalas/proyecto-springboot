package com.renta.infrastructure.adapter.out.persistence.mapper;

import com.renta.domain.model.entity.Category;
import com.renta.infrastructure.adapter.out.persistence.entity.CategoryJpaEntity;

public final class CategoryJpaMapper {

    private CategoryJpaMapper() {}

    public static Category toDomain(CategoryJpaEntity entity) {
        if (entity == null) return null;
        return new Category(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getIconName()
        );
    }

    public static CategoryJpaEntity toJpa(Category domain) {
        if (domain == null) return null;
        return new CategoryJpaEntity(
                domain.getId(),
                domain.getName(),
                domain.getDescription(),
                domain.getIconName()
        );
    }
}
