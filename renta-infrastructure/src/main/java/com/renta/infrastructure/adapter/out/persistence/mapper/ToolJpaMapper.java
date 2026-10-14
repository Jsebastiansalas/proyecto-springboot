package com.renta.infrastructure.adapter.out.persistence.mapper;

import com.renta.domain.model.entity.Tool;
import com.renta.domain.model.entity.ToolImage;
import com.renta.domain.model.entity.ToolPricingTier;
import com.renta.domain.model.entity.ToolSafetyRequirement;
import com.renta.domain.model.entity.ToolSpecification;
import com.renta.domain.model.enums.PricingTierType;
import com.renta.domain.model.enums.ToolStatus;
import com.renta.domain.model.vo.Money;
import com.renta.infrastructure.adapter.out.persistence.entity.ToolImageJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.entity.ToolJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.entity.ToolPricingTierJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.entity.ToolSafetyRequirementJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.entity.ToolSpecificationJpaEntity;

public final class ToolJpaMapper {

    private ToolJpaMapper() {}

    public static Tool toDomain(ToolJpaEntity entity) {
        if (entity == null) return null;
        ToolStatus status;
        try {
            status = ToolStatus.valueOf(entity.getStatus());
        } catch (Exception e) {
            status = ToolStatus.DISPONIBLE;
        }

        Tool domain = new Tool(
                entity.getId(),
                entity.getProviderId(),
                entity.getCategoryId(),
                entity.getCodeSku(),
                entity.getName(),
                entity.getBrand(),
                entity.getModel(),
                entity.getDescription(),
                entity.getBaseDailyPrice() != null ? Money.cop(entity.getBaseDailyPrice()) : null,
                entity.getDepositAmount() != null ? Money.cop(entity.getDepositAmount()) : Money.zero(),
                status,
                entity.getMainImageUrl(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );

        if (entity.getImages() != null) {
            for (ToolImageJpaEntity img : entity.getImages()) {
                domain.addImage(new ToolImage(img.getId(), entity.getId(), img.getImageUrl(), img.isPrimary(), img.getCaption()));
            }
        }

        if (entity.getSpecifications() != null) {
            for (ToolSpecificationJpaEntity spec : entity.getSpecifications()) {
                domain.addSpecification(new ToolSpecification(spec.getId(), entity.getId(), spec.getSpecName(), spec.getSpecValue()));
            }
        }

        if (entity.getPricingTiers() != null) {
            for (ToolPricingTierJpaEntity tier : entity.getPricingTiers()) {
                PricingTierType tierType;
                try {
                    tierType = PricingTierType.valueOf(tier.getTierType());
                } catch (Exception e) {
                    tierType = PricingTierType.SEMANAL;
                }
                domain.addPricingTier(new ToolPricingTier(tier.getId(), entity.getId(), tierType, tier.getMinDays(), Money.cop(tier.getPricePerDay())));
            }
        }

        if (entity.getSafetyRequirements() != null) {
            for (ToolSafetyRequirementJpaEntity req : entity.getSafetyRequirements()) {
                domain.addSafetyRequirement(new ToolSafetyRequirement(req.getId(), entity.getId(), req.getRequirementName(), req.getDescription()));
            }
        }

        return domain;
    }

    public static ToolJpaEntity toJpa(Tool domain) {
        if (domain == null) return null;
        ToolJpaEntity entity = new ToolJpaEntity(
                domain.getId(),
                domain.getProviderId(),
                domain.getCategoryId(),
                domain.getCodeSku(),
                domain.getName(),
                domain.getBrand(),
                domain.getModel(),
                domain.getDescription(),
                domain.getBaseDailyPrice() != null ? domain.getBaseDailyPrice().amount() : null,
                domain.getDepositAmount() != null ? domain.getDepositAmount().amount() : null,
                domain.getStatus() != null ? domain.getStatus().name() : "DISPONIBLE",
                domain.getMainImageUrl(),
                domain.getCreatedAt(),
                domain.getUpdatedAt()
        );

        if (domain.getImages() != null) {
            for (ToolImage img : domain.getImages()) {
                entity.getImages().add(new ToolImageJpaEntity(img.getId(), entity, img.getImageUrl(), img.isPrimary(), img.getCaption()));
            }
        }

        if (domain.getSpecifications() != null) {
            for (ToolSpecification spec : domain.getSpecifications()) {
                entity.getSpecifications().add(new ToolSpecificationJpaEntity(spec.getId(), entity, spec.getSpecName(), spec.getSpecValue()));
            }
        }

        if (domain.getPricingTiers() != null) {
            for (ToolPricingTier tier : domain.getPricingTiers()) {
                entity.getPricingTiers().add(new ToolPricingTierJpaEntity(tier.getId(), entity, tier.getTierType().name(), tier.getMinDays(), tier.getPricePerDay().amount()));
            }
        }

        if (domain.getSafetyRequirements() != null) {
            for (ToolSafetyRequirement req : domain.getSafetyRequirements()) {
                entity.getSafetyRequirements().add(new ToolSafetyRequirementJpaEntity(req.getId(), entity, req.getRequirementName(), req.getDescription()));
            }
        }

        return entity;
    }
}
