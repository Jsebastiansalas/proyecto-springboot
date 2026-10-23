package com.renta.infrastructure.adapter.in.rest;

import com.renta.application.dto.common.PagedResponse;
import com.renta.application.dto.tool.ToolResponse;
import com.renta.domain.model.enums.ToolStatus;
import com.renta.infrastructure.adapter.out.persistence.entity.ToolJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataToolRepository;
import com.renta.infrastructure.adapter.out.persistence.specification.ToolSpecification;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/tools")
@Tag(name = "2. Catálogo de Maquinaria y Equipos", description = "Endpoints de catálogo paginado y filtros avanzados")
public class ToolPagedController {

    private final SpringDataToolRepository toolRepository;

    public ToolPagedController(SpringDataToolRepository toolRepository) {
        this.toolRepository = toolRepository;
    }

    @GetMapping("/paged")
    @Operation(
            summary = "Catálogo paginado con filtros dinámicos (JPA Specification)",
            description = "Retorna herramientas paginadas con soporte para filtros combinados: texto, categoría, marca, precio min/max, estado y ordenamiento."
    )
    public ResponseEntity<PagedResponse<ToolResponse>> getToolsPaged(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false, defaultValue = "DISPONIBLE") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String[] sort) {

        String sortField = sort[0];
        Sort.Direction direction = (sort.length > 1 && sort[1].equalsIgnoreCase("asc"))
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(direction, sortField));

        Specification<ToolJpaEntity> spec = ToolSpecification.filter(query, categoryId, brand, minPrice, maxPrice, status);

        Page<ToolJpaEntity> pagedEntities = toolRepository.findAll(spec, pageable);

        Page<ToolResponse> pagedResponses = pagedEntities.map(this::mapEntityToResponse);

        return ResponseEntity.ok(new PagedResponse<>(
                pagedResponses.getContent(),
                pagedResponses.getNumber(),
                pagedResponses.getSize(),
                pagedResponses.getTotalElements(),
                pagedResponses.getTotalPages(),
                pagedResponses.isFirst(),
                pagedResponses.isLast(),
                pagedResponses.isEmpty()
        ));
    }

    private ToolResponse mapEntityToResponse(ToolJpaEntity e) {
        ToolStatus toolStatus;
        try {
            toolStatus = ToolStatus.valueOf(e.getStatus().toUpperCase());
        } catch (Exception ex) {
            toolStatus = ToolStatus.DISPONIBLE;
        }

        return new ToolResponse(
                e.getId(),
                e.getProviderId(),
                "Proveedor #" + e.getProviderId(),
                e.getCategoryId(),
                "Categoría #" + e.getCategoryId(),
                e.getCodeSku(),
                e.getName(),
                e.getBrand(),
                e.getModel(),
                e.getDescription(),
                e.getBaseDailyPrice(),
                e.getDepositAmount(),
                toolStatus,
                e.getMainImageUrl(),
                e.getCreatedAt(),
                5.0,
                0L
        );
    }
}
