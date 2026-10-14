package com.renta.infrastructure.adapter.out.persistence;

import com.renta.domain.model.entity.DamageReport;
import com.renta.domain.port.out.DamageReportRepositoryPort;
import com.renta.infrastructure.adapter.out.persistence.entity.DamageReportJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.mapper.DamageReportJpaMapper;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataDamageReportRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class DamageReportRepositoryAdapter implements DamageReportRepositoryPort {

    private final SpringDataDamageReportRepository repository;

    public DamageReportRepositoryAdapter(SpringDataDamageReportRepository repository) {
        this.repository = repository;
    }

    @Override
    public DamageReport save(DamageReport report) {
        DamageReportJpaEntity entity = DamageReportJpaMapper.toJpa(report);
        DamageReportJpaEntity saved = repository.save(entity);
        return DamageReportJpaMapper.toDomain(saved);
    }

    @Override
    public Optional<DamageReport> findById(Long id) {
        return repository.findById(id).map(DamageReportJpaMapper::toDomain);
    }

    @Override
    public List<DamageReport> findByReturnId(Long returnId) {
        return repository.findByReturnId(returnId).stream()
                .map(DamageReportJpaMapper::toDomain)
                .toList();
    }
}
