package com.renta.application.mapper;

import com.renta.application.dto.tool.CategoryResponse;
import com.renta.application.dto.tool.ToolDetailResponse;
import com.renta.application.dto.tool.ToolImageDto;
import com.renta.application.dto.tool.ToolPricingTierDto;
import com.renta.application.dto.tool.ToolResponse;
import com.renta.application.dto.tool.ToolSafetyRequirementDto;
import com.renta.application.dto.tool.ToolSpecificationDto;
import com.renta.domain.model.entity.Category;
import com.renta.domain.model.entity.Tool;
import com.renta.domain.model.entity.ToolImage;
import com.renta.domain.model.entity.ToolPricingTier;
import com.renta.domain.model.entity.ToolSafetyRequirement;
import com.renta.domain.model.entity.ToolSpecification;

import java.util.Collections;
import java.util.List;

public final class ToolDtoMapper {

    private ToolDtoMapper() {}

    public static ToolResponse toResponse(Tool tool, String providerName, String categoryName) {
        return toResponse(tool, providerName, categoryName, 5.0, 0L);
    }

    public static ToolResponse toResponse(Tool tool, String providerName, String categoryName, Double averageRating, Long totalReviews) {
        if (tool == null) return null;
        return new ToolResponse(
                tool.getId(),
                tool.getProviderId(),
                providerName,
                tool.getCategoryId(),
                categoryName,
                tool.getCodeSku(),
                tool.getName(),
                tool.getBrand(),
                tool.getModel(),
                tool.getDescription(),
                tool.getBaseDailyPrice() != null ? tool.getBaseDailyPrice().amount() : null,
                tool.getDepositAmount() != null ? tool.getDepositAmount().amount() : null,
                tool.getStatus(),
                tool.getMainImageUrl(),
                tool.getCreatedAt(),
                averageRating != null ? averageRating : 5.0,
                totalReviews != null ? totalReviews : 0L
        );
    }

    public static ToolDetailResponse toDetailResponse(Tool tool, String providerName, String categoryName) {
        if (tool == null) return null;
        List<ToolImageDto> images = tool.getImages() != null ? tool.getImages().stream()
                .map(ToolDtoMapper::toImageDto).toList() : Collections.emptyList();
        List<ToolSpecificationDto> specs = tool.getSpecifications() != null ? tool.getSpecifications().stream()
                .map(ToolDtoMapper::toSpecDto).toList() : Collections.emptyList();
        List<ToolPricingTierDto> tiers = tool.getPricingTiers() != null ? tool.getPricingTiers().stream()
                .map(ToolDtoMapper::toTierDto).toList() : Collections.emptyList();
        List<ToolSafetyRequirementDto> safety = tool.getSafetyRequirements() != null ? tool.getSafetyRequirements().stream()
                .map(ToolDtoMapper::toSafetyDto).toList() : Collections.emptyList();

        return new ToolDetailResponse(
                tool.getId(),
                tool.getProviderId(),
                providerName,
                tool.getCategoryId(),
                categoryName,
                tool.getCodeSku(),
                tool.getName(),
                tool.getBrand(),
                tool.getModel(),
                tool.getDescription(),
                tool.getBaseDailyPrice() != null ? tool.getBaseDailyPrice().amount() : null,
                tool.getDepositAmount() != null ? tool.getDepositAmount().amount() : null,
                tool.getStatus(),
                tool.getMainImageUrl(),
                tool.getCreatedAt(),
                images,
                specs,
                tiers,
                safety
        );
    }

    public static ToolImageDto toImageDto(ToolImage image) {
        if (image == null) return null;
        return new ToolImageDto(image.getId(), image.getImageUrl(), image.isPrimary(), image.getCaption());
    }

    public static ToolSpecificationDto toSpecDto(ToolSpecification spec) {
        if (spec == null) return null;
        return new ToolSpecificationDto(spec.getId(), spec.getSpecName(), spec.getSpecValue());
    }

    public static ToolPricingTierDto toTierDto(ToolPricingTier tier) {
        if (tier == null) return null;
        return new ToolPricingTierDto(
                tier.getId(),
                tier.getTierType(),
                tier.getMinDays(),
                tier.getPricePerDay() != null ? tier.getPricePerDay().amount() : null
        );
    }

    public static ToolSafetyRequirementDto toSafetyDto(ToolSafetyRequirement req) {
        if (req == null) return null;
        return new ToolSafetyRequirementDto(req.getId(), req.getRequirementName(), req.getDescription());
    }

    public static CategoryResponse toCategoryResponse(Category category) {
        if (category == null) return null;
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getIconName()
        );
    }
}
