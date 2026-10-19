package com.renta.application.service;

import com.renta.application.dto.tool.CategoryResponse;
import com.renta.application.dto.tool.CreateToolRequest;
import com.renta.application.dto.tool.ToolDetailResponse;
import com.renta.application.dto.tool.ToolImageDto;
import com.renta.application.dto.tool.ToolPricingTierDto;
import com.renta.application.dto.tool.ToolResponse;
import com.renta.application.dto.tool.ToolSafetyRequirementDto;
import com.renta.application.dto.tool.ToolSpecificationDto;
import com.renta.application.dto.tool.UpdateToolRequest;
import com.renta.application.mapper.ToolDtoMapper;
import com.renta.application.port.in.ToolQueryUseCase;
import com.renta.domain.exception.BusinessRuleViolationException;
import com.renta.domain.exception.ResourceNotFoundException;
import com.renta.domain.model.entity.Category;
import com.renta.domain.model.entity.Provider;
import com.renta.domain.model.entity.Tool;
import com.renta.domain.model.entity.ToolImage;
import com.renta.domain.model.entity.ToolPricingTier;
import com.renta.domain.model.entity.ToolSafetyRequirement;
import com.renta.domain.model.entity.ToolSpecification;
import com.renta.domain.model.enums.ToolStatus;
import com.renta.domain.model.vo.Money;
import com.renta.domain.port.in.ManageToolUseCase;
import com.renta.domain.port.out.CategoryRepositoryPort;
import com.renta.domain.port.out.ProviderRepositoryPort;
import com.renta.domain.port.out.ToolRepositoryPort;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

public class ToolApplicationService implements ManageToolUseCase, ToolQueryUseCase {

    private final ToolRepositoryPort toolRepository;
    private final CategoryRepositoryPort categoryRepository;
    private final ProviderRepositoryPort providerRepository;
    private final com.renta.domain.port.out.ReviewRepositoryPort reviewRepository;

    // Cache local ligero de categorías y proveedores para enriquecer DTOs
    private final Map<Integer, String> categoryNamesCache = new ConcurrentHashMap<>();
    private final Map<Long, String> providerNamesCache = new ConcurrentHashMap<>();

    public ToolApplicationService(
            ToolRepositoryPort toolRepository,
            CategoryRepositoryPort categoryRepository,
            ProviderRepositoryPort providerRepository) {
        this(toolRepository, categoryRepository, providerRepository, null);
    }

    public ToolApplicationService(
            ToolRepositoryPort toolRepository,
            CategoryRepositoryPort categoryRepository,
            ProviderRepositoryPort providerRepository,
            com.renta.domain.port.out.ReviewRepositoryPort reviewRepository) {
        this.toolRepository = Objects.requireNonNull(toolRepository);
        this.categoryRepository = Objects.requireNonNull(categoryRepository);
        this.providerRepository = Objects.requireNonNull(providerRepository);
        this.reviewRepository = reviewRepository;
    }

    @Override
    public Tool registerTool(Tool tool) {
        Objects.requireNonNull(tool, "La herramienta no puede ser nula");
        if (tool.getCodeSku() != null && toolRepository.findByCodeSku(tool.getCodeSku()).isPresent()) {
            throw new BusinessRuleViolationException("Ya existe una herramienta con el SKU: " + tool.getCodeSku());
        }
        return toolRepository.save(tool);
    }

    public ToolDetailResponse createTool(CreateToolRequest req) {
        if (toolRepository.findByCodeSku(req.codeSku()).isPresent()) {
            throw new BusinessRuleViolationException("Ya existe una herramienta con el SKU: " + req.codeSku());
        }
        if (!providerRepository.findById(req.providerId()).isPresent()) {
            throw new ResourceNotFoundException("Proveedor no encontrado con ID: " + req.providerId());
        }
        if (!categoryRepository.findById(req.categoryId()).isPresent()) {
            throw new ResourceNotFoundException("Categoría no encontrada con ID: " + req.categoryId());
        }

        Instant now = Instant.now();
        Tool tool = new Tool(
                null,
                req.providerId(),
                req.categoryId(),
                req.codeSku(),
                req.name(),
                req.brand(),
                req.model(),
                req.description(),
                Money.cop(req.baseDailyPrice()),
                Money.cop(req.depositAmount()),
                ToolStatus.DISPONIBLE,
                req.mainImageUrl(),
                now,
                now
        );

        if (req.images() != null) {
            for (ToolImageDto imgDto : req.images()) {
                tool.addImage(new ToolImage(null, null, imgDto.imageUrl(), imgDto.primary(), imgDto.caption()));
            }
        }
        if (req.specifications() != null) {
            for (ToolSpecificationDto specDto : req.specifications()) {
                tool.addSpecification(new ToolSpecification(null, null, specDto.specName(), specDto.specValue()));
            }
        }
        if (req.pricingTiers() != null) {
            for (ToolPricingTierDto tierDto : req.pricingTiers()) {
                tool.addPricingTier(new ToolPricingTier(null, null, tierDto.tierType(), tierDto.minDays(), Money.cop(tierDto.pricePerDay())));
            }
        }
        if (req.safetyRequirements() != null) {
            for (ToolSafetyRequirementDto reqDto : req.safetyRequirements()) {
                tool.addSafetyRequirement(new ToolSafetyRequirement(null, null, reqDto.requirementName(), reqDto.description()));
            }
        }

        Tool saved = toolRepository.save(tool);
        return getToolDetail(saved.getId());
    }

    public ToolDetailResponse updateTool(Long id, UpdateToolRequest req) {
        Tool tool = toolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Herramienta no encontrada con ID: " + id));

        tool.setCategoryId(req.categoryId());
        tool.setName(req.name());
        tool.setBrand(req.brand());
        tool.setModel(req.model());
        tool.setDescription(req.description());
        tool.setBaseDailyPrice(Money.cop(req.baseDailyPrice()));
        tool.setDepositAmount(Money.cop(req.depositAmount()));
        if (req.status() != null) {
            tool.setStatus(req.status());
        }
        if (req.mainImageUrl() != null) {
            tool.setMainImageUrl(req.mainImageUrl());
        }
        tool.setUpdatedAt(Instant.now());

        // Actualizar colecciones 4FN si se proporcionan
        if (req.images() != null) {
            tool.clearImages();
            for (ToolImageDto imgDto : req.images()) {
                tool.addImage(new ToolImage(null, id, imgDto.imageUrl(), imgDto.primary(), imgDto.caption()));
            }
        }
        if (req.specifications() != null) {
            tool.clearSpecifications();
            for (ToolSpecificationDto specDto : req.specifications()) {
                tool.addSpecification(new ToolSpecification(null, id, specDto.specName(), specDto.specValue()));
            }
        }
        if (req.pricingTiers() != null) {
            tool.clearPricingTiers();
            for (ToolPricingTierDto tierDto : req.pricingTiers()) {
                tool.addPricingTier(new ToolPricingTier(null, id, tierDto.tierType(), tierDto.minDays(), Money.cop(tierDto.pricePerDay())));
            }
        }
        if (req.safetyRequirements() != null) {
            tool.clearSafetyRequirements();
            for (ToolSafetyRequirementDto reqDto : req.safetyRequirements()) {
                tool.addSafetyRequirement(new ToolSafetyRequirement(null, id, reqDto.requirementName(), reqDto.description()));
            }
        }

        Tool updated = toolRepository.save(tool);
        return getToolDetail(updated.getId());
    }

    @Override
    public void updateToolStatus(Long toolId, ToolStatus newStatus) {
        Tool tool = toolRepository.findById(toolId)
                .orElseThrow(() -> new ResourceNotFoundException("Herramienta no encontrada con ID: " + toolId));
        tool.setStatus(newStatus);
        tool.setUpdatedAt(Instant.now());
        toolRepository.save(tool);
    }

    @Override
    public List<ToolResponse> listAvailableTools() {
        return toolRepository.findAllAvailable().stream()
                .map(this::enrichToolResponse)
                .toList();
    }

    @Override
    public List<ToolResponse> listToolsByCategory(Integer categoryId) {
        return toolRepository.findByCategoryId(categoryId).stream()
                .map(this::enrichToolResponse)
                .toList();
    }

    @Override
    public List<ToolResponse> listToolsByProvider(Long providerId) {
        return toolRepository.findByProviderId(providerId).stream()
                .map(this::enrichToolResponse)
                .toList();
    }

    @Override
    public ToolDetailResponse getToolDetail(Long toolId) {
        Tool tool = toolRepository.findById(toolId)
                .orElseThrow(() -> new ResourceNotFoundException("Herramienta no encontrada con ID: " + toolId));
        String provName = resolveProviderName(tool.getProviderId());
        String catName = resolveCategoryName(tool.getCategoryId());
        return ToolDtoMapper.toDetailResponse(tool, provName, catName);
    }

    @Override
    public List<CategoryResponse> listCategories() {
        return categoryRepository.findAll().stream()
                .map(ToolDtoMapper::toCategoryResponse)
                .toList();
    }

    @Override
    public List<ToolResponse> searchTools(String query, Integer categoryId, Double minPrice, Double maxPrice) {
        List<Tool> all = toolRepository.findAllAvailable();
        return all.stream()
                .filter(t -> categoryId == null || t.getCategoryId().equals(categoryId))
                .filter(t -> query == null || query.isBlank()
                        || t.getName().toLowerCase().contains(query.toLowerCase())
                        || t.getBrand().toLowerCase().contains(query.toLowerCase())
                        || t.getDescription().toLowerCase().contains(query.toLowerCase()))
                .filter(t -> minPrice == null || t.getBaseDailyPrice().amount().doubleValue() >= minPrice)
                .filter(t -> maxPrice == null || t.getBaseDailyPrice().amount().doubleValue() <= maxPrice)
                .map(this::enrichToolResponse)
                .toList();
    }

    private ToolResponse enrichToolResponse(Tool tool) {
        String provName = resolveProviderName(tool.getProviderId());
        String catName = resolveCategoryName(tool.getCategoryId());
        Double avgRating = 5.0;
        Long totalReviews = 0L;
        if (reviewRepository != null && tool.getId() != null) {
            List<com.renta.domain.model.entity.Review> revs = reviewRepository.findByToolId(tool.getId());
            if (revs != null && !revs.isEmpty()) {
                totalReviews = (long) revs.size();
                double sum = 0.0;
                for (com.renta.domain.model.entity.Review r : revs) {
                    sum += r.getRating();
                }
                avgRating = Math.round((sum / revs.size()) * 10.0) / 10.0;
            }
        }
        return ToolDtoMapper.toResponse(tool, provName, catName, avgRating, totalReviews);
    }

    private String resolveProviderName(Long providerId) {
        if (providerId == null) return "Desconocido";
        return providerNamesCache.computeIfAbsent(providerId, id ->
                providerRepository.findById(id).map(Provider::getCompanyName).orElse("Proveedor #" + id));
    }

    private String resolveCategoryName(Integer categoryId) {
        if (categoryId == null) return "General";
        return categoryNamesCache.computeIfAbsent(categoryId, id ->
                categoryRepository.findById(id).map(Category::getName).orElse("Categoría #" + id));
    }
}
