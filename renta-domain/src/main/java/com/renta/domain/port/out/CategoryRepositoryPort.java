package com.renta.domain.port.out;

import com.renta.domain.model.entity.Category;

import java.util.List;
import java.util.Optional;

/**
 * Outbound repository port for {@link Category} taxonomy persistence.
 */
public interface CategoryRepositoryPort {

    Category save(Category category);

    Optional<Category> findById(Integer id);

    List<Category> findAll();
}
