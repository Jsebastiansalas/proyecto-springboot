package com.renta.infrastructure.adapter.out.persistence;

import com.renta.domain.model.entity.Category;
import com.renta.domain.port.out.CategoryRepositoryPort;
import com.renta.infrastructure.adapter.out.persistence.entity.CategoryJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.mapper.CategoryJpaMapper;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataCategoryRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class CategoryRepositoryAdapter implements CategoryRepositoryPort {

    private final SpringDataCategoryRepository repository;

    public CategoryRepositoryAdapter(SpringDataCategoryRepository repository) {
        this.repository = repository;
    }

    @Override
    public Category save(Category category) {
        CategoryJpaEntity entity = CategoryJpaMapper.toJpa(category);
        CategoryJpaEntity saved = repository.save(entity);
        return CategoryJpaMapper.toDomain(saved);
    }

    @Override
    public Optional<Category> findById(Integer id) {
        return repository.findById(id).map(CategoryJpaMapper::toDomain);
    }

    @Override
    public List<Category> findAll() {
        return repository.findAll().stream()
                .map(CategoryJpaMapper::toDomain)
                .toList();
    }
}
