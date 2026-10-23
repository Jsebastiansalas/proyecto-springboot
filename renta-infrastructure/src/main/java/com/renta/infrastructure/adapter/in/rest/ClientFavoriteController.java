package com.renta.infrastructure.adapter.in.rest;

import com.renta.application.dto.tool.FavoriteToolResponse;
import com.renta.application.service.ClientFavoriteApplicationService;
import com.renta.domain.exception.ResourceNotFoundException;
import com.renta.domain.port.out.ClientRepositoryPort;
import com.renta.infrastructure.adapter.out.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * ============================================================================
 * CONTROLADOR REST: LISTA DE HERRAMIENTAS FAVORITAS / WISHLIST DEL CLIENTE
 * ============================================================================
 */
@RestController
@RequestMapping("/api/v1")
@Tag(name = "15. Lista de Favoritos (Wishlist)", description = "Gestión de herramientas favoritas y lista de deseos para clientes")
public class ClientFavoriteController {

    private final ClientFavoriteApplicationService favoriteService;
    private final ClientRepositoryPort clientRepository;

    public ClientFavoriteController(
            ClientFavoriteApplicationService favoriteService,
            ClientRepositoryPort clientRepository) {
        this.favoriteService = favoriteService;
        this.clientRepository = clientRepository;
    }

    private Long resolveClientId(CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new ResourceNotFoundException("Usuario no autenticado");
        }
        return clientRepository.findByUserId(userDetails.getId())
                .map(com.renta.domain.model.entity.Client::getId)
                .orElse(1L);
    }

    @PostMapping("/tools/{id:[0-9]+}/favorite")
    @PreAuthorize("hasAnyRole('CLIENTE', 'ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Marcar herramienta como favorita", description = "Agrega una herramienta a la lista de deseos/favoritos del cliente autenticado.")
    public ResponseEntity<Map<String, Object>> addFavorite(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long clientId = resolveClientId(userDetails);
        favoriteService.addFavorite(clientId, id);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "toolId", id,
                "clientId", clientId,
                "favorite", true,
                "message", "Herramienta agregada a favoritos"
        ));
    }

    @DeleteMapping("/tools/{id:[0-9]+}/favorite")
    @PreAuthorize("hasAnyRole('CLIENTE', 'ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Eliminar de favoritos", description = "Remueve una herramienta de la lista de deseos/favoritos del cliente autenticado.")
    public ResponseEntity<Void> removeFavorite(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long clientId = resolveClientId(userDetails);
        favoriteService.removeFavorite(clientId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tools/{id:[0-9]+}/favorite")
    @PreAuthorize("hasAnyRole('CLIENTE', 'ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Verificar si es favorita", description = "Verifica si una herramienta específica está en la lista de favoritos del cliente.")
    public ResponseEntity<Map<String, Object>> isFavorite(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long clientId = resolveClientId(userDetails);
        boolean fav = favoriteService.isFavorite(clientId, id);
        return ResponseEntity.ok(Map.of("toolId", id, "favorite", fav));
    }

    @GetMapping("/clients/my-favorites")
    @PreAuthorize("hasAnyRole('CLIENTE', 'ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Listar favoritos del cliente", description = "Retorna el catálogo completo de herramientas guardadas como favoritas por el cliente autenticado.")
    public ResponseEntity<List<FavoriteToolResponse>> getMyFavorites(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long clientId = resolveClientId(userDetails);
        return ResponseEntity.ok(favoriteService.getClientFavorites(clientId));
    }
}
