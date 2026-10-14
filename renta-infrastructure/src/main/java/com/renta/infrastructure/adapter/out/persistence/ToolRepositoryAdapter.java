package com.renta.infrastructure.adapter.out.persistence;

import com.renta.domain.model.entity.Tool;
import com.renta.domain.model.enums.ToolStatus;
import com.renta.domain.model.vo.DateRange;
import com.renta.domain.port.out.ToolRepositoryPort;
import com.renta.infrastructure.adapter.out.persistence.entity.ToolJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.mapper.ToolJpaMapper;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataReservationRepository;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataToolRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Component
public class ToolRepositoryAdapter implements ToolRepositoryPort {

    private final SpringDataToolRepository repository;
    private final SpringDataReservationRepository reservationRepository;

    public ToolRepositoryAdapter(SpringDataToolRepository repository, SpringDataReservationRepository reservationRepository) {
        this.repository = repository;
        this.reservationRepository = reservationRepository;
    }

    @Override
    @Transactional
    public Tool save(Tool tool) {
        ToolJpaEntity entity = ToolJpaMapper.toJpa(tool);
        ToolJpaEntity saved = repository.save(entity);
        return ToolJpaMapper.toDomain(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Tool> findById(Long id) {
        return repository.findById(id).map(ToolJpaMapper::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Tool> findByCodeSku(String codeSku) {
        return repository.findByCodeSku(codeSku).map(ToolJpaMapper::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Tool> findByCategoryId(Integer categoryId) {
        return repository.findByCategoryId(categoryId).stream()
                .map(ToolJpaMapper::toDomain)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Tool> findByProviderId(Long providerId) {
        return repository.findByProviderId(providerId).stream()
                .map(ToolJpaMapper::toDomain)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Tool> findByStatus(ToolStatus status) {
        String statusStr = status != null ? status.name() : "DISPONIBLE";
        return repository.findByStatus(statusStr).stream()
                .map(ToolJpaMapper::toDomain)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Tool> findAllAvailable() {
        return repository.findByStatus("DISPONIBLE").stream()
                .map(ToolJpaMapper::toDomain)
                .toList();
    }

    @Override
    public boolean existsById(Long id) {
        return repository.existsById(id);
    }

    @Override
    public boolean existsOverlappingReservation(Long toolId, DateRange dateRange) {
        if (dateRange == null) return false;
        return reservationRepository.existsOverlapping(toolId, dateRange.startDate(), dateRange.endDate());
    }
}
