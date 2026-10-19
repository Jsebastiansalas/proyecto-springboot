package com.renta.infrastructure.adapter.in.rest;

import com.renta.application.dto.auth.UserSummaryDto;
import com.renta.application.port.in.AuthUseCase;
import com.renta.application.service.AuthApplicationService;
import com.renta.domain.model.entity.Provider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * ============================================================================
 * CONTROLADOR REST: ADMINISTRACIÓN DEL SISTEMA (AdminController)
 * ============================================================================
 * 
 * ¿QUÉ HACE ESTE CONTROLADOR?
 * Expone las rutas exclusivas del rol ADMIN para gestionar la plataforma:
 * 1. Listar todos los usuarios y activar/desactivar sus cuentas.
 * 2. Listar todas las empresas proveedoras y aprobar o suspender su verificación.
 * 
 * SEGURIDAD:
 * Todas las rutas de esta clase están protegidas con @PreAuthorize("hasRole('ADMIN')"),
 * lo que significa que solo un usuario con token JWT válido que contenga el rol
 * ROLE_ADMIN puede consumirlas.
 */
@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "8. Administración del Sistema", description = "Endpoints de gestión global: usuarios y verificación de proveedores")
public class AdminController {

    private final AuthUseCase authService;

    public AdminController(AuthUseCase authService) {
        this.authService = authService;
    }

    /**
     * HU-03: LISTAR TODOS LOS USUARIOS
     * Retorna la lista consolidada de cuentas registradas en la base de datos (Clientes, Proveedores y Admins).
     */
    @GetMapping("/users")
    @Operation(summary = "Listar todos los usuarios", description = "Retorna todos los usuarios registrados con su rol y estado activo/inactivo.")
    public ResponseEntity<List<UserSummaryDto>> listAllUsers() {
        List<UserSummaryDto> users = authService.listAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * HU-03: ACTIVAR / DESACTIVAR USUARIO
     * Permite al administrador suspender una cuenta o reactivarla sin borrar sus registros históricos.
     */
    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Cambiar estado de cuenta de usuario", description = "Activa (true) o desactiva (false) la cuenta de un usuario.")
    public ResponseEntity<Void> toggleUserStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        authService.toggleUserStatus(id, active);
        return ResponseEntity.noContent().build();
    }

    /**
     * HU-03: LISTAR PROVEEDORES
     * Retorna todas las empresas registradas para auditoría de cumplimiento y verificación de NIT/RUT.
     */
    @GetMapping("/providers")
    @Operation(summary = "Listar proveedores", description = "Retorna todas las empresas de maquinaria registradas en el sistema.")
    public ResponseEntity<List<Provider>> listAllProviders() {
        List<Provider> providers = authService.listAllProviders();
        return ResponseEntity.ok(providers);
    }

    /**
     * HU-03: VERIFICAR / APROBAR PROVEEDOR
     * Cambia la bandera verified a true o false para permitir o restringir la publicación de maquinaria.
     */
    @PatchMapping("/providers/{id}/verify")
    @Operation(summary = "Verificar empresa proveedora", description = "Aprueba (true) o retira la verificación (false) de una empresa proveedora.")
    public ResponseEntity<Void> verifyProvider(
            @PathVariable Long id,
            @RequestParam boolean verified) {
        authService.verifyProvider(id, verified);
        return ResponseEntity.noContent().build();
    }
}
