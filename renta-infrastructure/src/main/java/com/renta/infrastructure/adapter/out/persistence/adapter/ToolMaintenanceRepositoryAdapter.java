package com.renta.infrastructure.adapter.out.persistence.adapter;

import com.renta.domain.model.entity.ToolMaintenance;
import com.renta.domain.model.enums.MaintenanceStatus;
import com.renta.domain.model.enums.MaintenanceType;
import com.renta.domain.model.vo.Money;
import com.renta.domain.port.out.ToolMaintenanceRepositoryPort;
import com.renta.infrastructure.adapter.out.persistence.entity.ToolMaintenanceJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataToolMaintenanceRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class ToolMaintenanceRepositoryAdapter implements ToolMaintenanceRepositoryPort {

    private final SpringDataToolMaintenanceRepository springRepo;

    public ToolMaintenanceRepositoryAdapter(SpringDataToolMaintenanceRepository springRepo) {
        this.springRepo = springRepo;
    }

    @Override
    public ToolMaintenance save(ToolMaintenance domain) {
        ToolMaintenanceJpaEntity entity = toEntity(domain);
        ToolMaintenanceJpaEntity saved = springRepo.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<ToolMaintenance> findById(Long id) {
        return springRepo.findById(id).map(this::toDomain);
    }

    @Override
    public List<ToolMaintenance> findByToolId(Long toolId) {
        return springRepo.findByToolIdOrderByStartDateDesc(toolId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<ToolMaintenance> findAllActive() {
        return springRepo.findByStatus("EN_PROCESO").stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    private ToolMaintenance toDomain(ToolMaintenanceJpaEntity entity) {
        return new ToolMaintenance(
                entity.getId(),
                entity.getToolId(),
                MaintenanceType.valueOf(entity.getMaintenanceType()),
                entity.getStartDate(),
                entity.getEndDate(),
                Money.of(entity.getCost()),
                entity.getTechnicianName(),
                entity.getDescription(),
                MaintenanceStatus.valueOf(entity.getStatus()),
                entity.getCreatedAt()
        );
    }

    private ToolMaintenanceJpaEntity toEntity(ToolMaintenance domain) {
        ToolMaintenanceJpaEntity entity = new ToolMaintenanceJpaEntity();
        entity.setId(domain.getId());
        entity.setToolId(domain.getToolId());
        entity.setMaintenanceType(domain.getType().name());
        entity.setStartDate(domain.getStartDate());
        entity.setEndDate(domain.getEndDate());
        entity.setCost(domain.getCost() != null ? domain.getCost().amount() : java.math.BigDecimal.ZERO);
        entity.setTechnicianName(domain.getTechnicianName());
        entity.setDescription(domain.getDescription());
        entity.setStatus(domain.getStatus().name());
        entity.setCreatedAt(domain.getCreatedAt());
        return entity;
    }
}
