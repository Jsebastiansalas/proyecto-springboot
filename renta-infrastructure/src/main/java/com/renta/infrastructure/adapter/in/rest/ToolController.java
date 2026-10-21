package com.renta.infrastructure.adapter.in.rest;

import com.renta.application.dto.tool.CategoryResponse;
import com.renta.application.dto.tool.CreateToolRequest;
import com.renta.application.dto.tool.ToolDetailResponse;
import com.renta.application.dto.tool.ToolResponse;
import com.renta.application.dto.tool.UpdateToolRequest;
import com.renta.application.service.ToolApplicationService;
import com.renta.domain.model.enums.ToolStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * ============================================================================
 * ADAPTADOR PRIMARIO REST: CONTROLADOR DEL CATÁLOGO DE HERRAMIENTAS
 * ============================================================================
 * 
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Expone los endpoints HTTP bajo `/api/v1/tools`:
 * 1. `GET /api/v1/tools`: Catálogo público con filtros por texto, categoría y disponibilidad.
 * 2. `GET /api/v1/tools/{id}`: Ficha técnica detallada en Cuarta Forma Normal (4FN).
 * 3. `GET /api/v1/tools/categories`: Listado de las 20 categorías del sistema.
 * 4. `POST /api/v1/tools`: Creación de equipos (requiere rol PROVEEDOR o ADMIN).
 * 5. `PUT /api/v1/tools/{id}`: Edición de características y tarifas base.
 * 
 * ¿POR QUÉ ESTÁ CREADO Y DÓNDE ENCAJA EN LA ARQUITECTURA?
 * En la Arquitectura Hexagonal, conecta la web y los clientes móviles con el
 * servicio {@link ToolApplicationService}, serializando las entidades a DTOs
 * enriquecidos con URLs de imágenes locales.
 */
@RestController
@RequestMapping("/api/v1/tools")
@Tag(name = "2. Catálogo de Maquinaria y Equipos", description = "Endpoints públicos de consulta y privados para gestión de herramientas")
public class ToolController {

    private final ToolApplicationService toolService;
    private final com.renta.domain.port.out.ProviderRepositoryPort providerRepository;

    public ToolController(ToolApplicationService toolService, com.renta.domain.port.out.ProviderRepositoryPort providerRepository) {
        this.toolService = toolService;
        this.providerRepository = providerRepository;
    }

    @GetMapping
    @Operation(summary = "Catálogo público y búsqueda", description = "Lista herramientas disponibles con soporte para filtros por texto, categoría y rango de precio.")
    public ResponseEntity<List<ToolResponse>> searchTools(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {
        List<ToolResponse> list = toolService.searchTools(query, categoryId, minPrice, maxPrice);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/categories")
    @Operation(summary = "Categorías de equipos", description = "Lista todas las categorías de herramientas disponibles.")
    public ResponseEntity<List<CategoryResponse>> listCategories() {
        return ResponseEntity.ok(toolService.listCategories());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Ficha detallada de la herramienta (4FN)", description = "Obtiene los detalles completos de la herramienta: especificaciones técnicas, tiers de descuento por volumen, requisitos de seguridad e imágenes.")
    public ResponseEntity<ToolDetailResponse> getToolDetail(@PathVariable Long id) {
        return ResponseEntity.ok(toolService.getToolDetail(id));
    }

    @GetMapping("/provider/{providerId}")
    @Operation(summary = "Herramientas de un proveedor", description = "Lista todas las herramientas pertenecientes a un proveedor específico.")
    public ResponseEntity<List<ToolResponse>> listToolsByProvider(@PathVariable Long providerId) {
        return ResponseEntity.ok(toolService.listToolsByProvider(providerId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROVEEDOR')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Registrar nueva herramienta", description = "Crea una herramienta con todas sus relaciones normalizadas 4FN (imágenes, especificaciones, precios y seguridad). Requiere rol PROVEEDOR o ADMIN.")
    public ResponseEntity<ToolDetailResponse> createTool(
            @Valid @RequestBody CreateToolRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.renta.infrastructure.adapter.out.security.CustomUserDetails userDetails) {
        
        Long providerId = request.providerId();
        if (providerId == null && userDetails != null && userDetails.getId() != null) {
            providerId = providerRepository.findByUserId(userDetails.getId())
                    .map(com.renta.domain.model.entity.Provider::getId)
                    .orElse(1L);
        } else if (providerId == null) {
            providerId = 1L;
        }

        String sku = (request.codeSku() != null && !request.codeSku().isBlank())
                ? request.codeSku()
                : "HERR-" + (System.currentTimeMillis() % 100000);

        CreateToolRequest finalReq = new CreateToolRequest(
                providerId,
                request.categoryId(),
                sku,
                request.name(),
                request.brand(),
                request.model(),
                request.description(),
                request.baseDailyPrice(),
                request.depositAmount(),
                request.mainImageUrl(),
                request.images(),
                request.specifications(),
                request.pricingTiers(),
                request.safetyRequirements()
        );

        ToolDetailResponse created = toolService.createTool(finalReq);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROVEEDOR') and @authz.canModifyTool(principal, #id)")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Actualizar herramienta existente", description = "Actualiza la información y colecciones normalizadas de la herramienta. Requiere rol PROVEEDOR titular o ADMIN.")
    public ResponseEntity<ToolDetailResponse> updateTool(@PathVariable Long id, @Valid @RequestBody UpdateToolRequest request) {
        return ResponseEntity.ok(toolService.updateTool(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROVEEDOR') and @authz.canModifyTool(principal, #id)")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Cambiar estado de herramienta", description = "Cambia el estado de una herramienta (DISPONIBLE, ALQUILADA, MANTENIMIENTO, RETIRADA). Requiere rol PROVEEDOR titular o ADMIN.")
    public ResponseEntity<Void> updateToolStatus(@PathVariable Long id, @RequestParam ToolStatus status) {
        toolService.updateToolStatus(id, status);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROVEEDOR') and @authz.canModifyTool(principal, #id)")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Eliminar / retirar herramienta del inventario", description = "Cambia el estado a RETIRADA para dar de baja la herramienta del inventario. Requiere rol PROVEEDOR titular o ADMIN.")
    public ResponseEntity<Void> deleteTool(@PathVariable Long id) {
        toolService.updateToolStatus(id, ToolStatus.RETIRADA);
        return ResponseEntity.noContent().build();
    }
}
