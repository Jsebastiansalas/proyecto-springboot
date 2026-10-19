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

import com.renta.domain.model.entity.ToolImage;
import com.renta.domain.model.entity.ToolPricingTier;
import com.renta.domain.model.entity.ToolSafetyRequirement;
import com.renta.domain.model.entity.ToolSpecification;
import com.renta.infrastructure.adapter.out.persistence.entity.ToolImageJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.entity.ToolPricingTierJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.entity.ToolSafetyRequirementJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.entity.ToolSpecificationJpaEntity;

import java.time.Instant;
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
        if (tool.getId() != null) {
            Optional<ToolJpaEntity> existingOpt = repository.findById(tool.getId());
            if (existingOpt.isPresent()) {
                ToolJpaEntity existing = existingOpt.get();

                // Actualizar atributos de la herramienta
                if (tool.getCategoryId() != null) existing.setCategoryId(tool.getCategoryId());
                if (tool.getName() != null) existing.setName(tool.getName());
                if (tool.getBrand() != null) existing.setBrand(tool.getBrand());
                if (tool.getModel() != null) existing.setModel(tool.getModel());
                if (tool.getDescription() != null) existing.setDescription(tool.getDescription());
                if (tool.getBaseDailyPrice() != null) existing.setBaseDailyPrice(tool.getBaseDailyPrice().amount());
                if (tool.getDepositAmount() != null) existing.setDepositAmount(tool.getDepositAmount().amount());
                if (tool.getStatus() != null) existing.setStatus(tool.getStatus().name());
                if (tool.getMainImageUrl() != null) existing.setMainImageUrl(tool.getMainImageUrl());
                existing.setUpdatedAt(tool.getUpdatedAt() != null ? tool.getUpdatedAt() : Instant.now());

                // Actualizar colecciones 4FN mediante sincronización en sitio (evita duplicidad de restricciones únicas)
                if (tool.getImages() != null) {
                    existing.getImages().clear();
                    for (ToolImage img : tool.getImages()) {
                        existing.getImages().add(new ToolImageJpaEntity(null, existing, img.getImageUrl(), img.isPrimary(), img.getCaption()));
                    }
                }

                if (tool.getSpecifications() != null) {
                    existing.getSpecifications().removeIf(es ->
                        tool.getSpecifications().stream().noneMatch(s -> s.getSpecName().equalsIgnoreCase(es.getSpecName()))
                    );
                    for (ToolSpecification newSpec : tool.getSpecifications()) {
                        Optional<ToolSpecificationJpaEntity> match = existing.getSpecifications().stream()
                                .filter(es -> es.getSpecName().equalsIgnoreCase(newSpec.getSpecName()))
                                .findFirst();
                        if (match.isPresent()) {
                            match.get().setSpecValue(newSpec.getSpecValue());
                        } else {
                            existing.getSpecifications().add(new ToolSpecificationJpaEntity(null, existing, newSpec.getSpecName(), newSpec.getSpecValue()));
                        }
                    }
                }

                if (tool.getPricingTiers() != null) {
                    existing.getPricingTiers().removeIf(existingTier ->
                        tool.getPricingTiers().stream().noneMatch(t -> t.getTierType().name().equalsIgnoreCase(existingTier.getTierType()))
                    );
                    for (ToolPricingTier newTier : tool.getPricingTiers()) {
                        Optional<ToolPricingTierJpaEntity> match = existing.getPricingTiers().stream()
                                .filter(et -> et.getTierType().equalsIgnoreCase(newTier.getTierType().name()))
                                .findFirst();
                        if (match.isPresent()) {
                            match.get().setMinDays(newTier.getMinDays());
                            match.get().setPricePerDay(newTier.getPricePerDay().amount());
                        } else {
                            existing.getPricingTiers().add(new ToolPricingTierJpaEntity(null, existing, newTier.getTierType().name(), newTier.getMinDays(), newTier.getPricePerDay().amount()));
                        }
                    }
                }

                if (tool.getSafetyRequirements() != null) {
                    existing.getSafetyRequirements().removeIf(er ->
                        tool.getSafetyRequirements().stream().noneMatch(r -> r.getRequirementName().equalsIgnoreCase(er.getRequirementName()))
                    );
                    for (ToolSafetyRequirement newReq : tool.getSafetyRequirements()) {
                        Optional<ToolSafetyRequirementJpaEntity> match = existing.getSafetyRequirements().stream()
                                .filter(er -> er.getRequirementName().equalsIgnoreCase(newReq.getRequirementName()))
                                .findFirst();
                        if (match.isPresent()) {
                            match.get().setDescription(newReq.getDescription());
                        } else {
                            existing.getSafetyRequirements().add(new ToolSafetyRequirementJpaEntity(null, existing, newReq.getRequirementName(), newReq.getDescription()));
                        }
                    }
                }

                ToolJpaEntity saved = repository.save(existing);
                return ToolJpaMapper.toDomain(saved);
            }
        }

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
    @Transactional(readOnly = true)
    public List<Tool> findAll() {
        return repository.findAll().stream()
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
