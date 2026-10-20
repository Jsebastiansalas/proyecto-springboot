package com.renta.infrastructure.adapter.in.rest;

import com.renta.application.dto.auth.ChangePasswordRequest;
import com.renta.application.dto.auth.LoginRequest;
import com.renta.application.dto.auth.LoginResponse;
import com.renta.application.dto.auth.RegisterClientRequest;
import com.renta.application.dto.auth.RegisterProviderRequest;
import com.renta.application.dto.auth.UserSummaryDto;
import com.renta.application.service.AuthApplicationService;
import com.renta.domain.port.out.ClientRepositoryPort;
import com.renta.domain.port.out.ProviderRepositoryPort;
import com.renta.infrastructure.adapter.out.security.CustomUserDetails;
import com.renta.infrastructure.config.security.LoginRateLimiterFilter;
import com.renta.infrastructure.config.security.SecurityAuditLogger;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * ============================================================================
 * ADAPTADOR PRIMARIO REST: CONTROLADOR DE AUTENTICACIÓN Y REGISTRO
 * ============================================================================
 * 
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Es la puerta de entrada pública del sistema para la gestión de usuarios:
 * 1. `POST /api/v1/auth/login`: Autentica credenciales y emite el JWT.
 * 2. `POST /api/v1/auth/register-client`: Registra clientes con tipo y número de documento.
 * 3. `POST /api/v1/auth/register-provider`: Registra empresas proveedoras con NIT y razón social.
 * 4. `POST /api/v1/auth/change-password`: Permite actualizar contraseñas de forma segura.
 * 5. `GET /api/v1/auth/profile`: Devuelve los datos del usuario autenticado actual.
 * 
 * ¿POR QUÉ ESTÁ CREADO Y DÓNDE ENCAJA EN LA ARQUITECTURA?
 * En la Arquitectura Hexagonal, adapta el protocolo HTTP al servicio
 * {@link AuthApplicationService}. Los endpoints están exentos de token JWT en
 * {@link SecurityConfig} excepto `/change-password` y `/profile`.
 */
@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "1. Autenticación y Cuentas", description = "Endpoints públicos de inicio de sesión y registro de clientes/proveedores")
public class AuthController {

    private final AuthApplicationService authService;
    private final ClientRepositoryPort clientRepository;
    private final ProviderRepositoryPort providerRepository;
    private final LoginRateLimiterFilter rateLimiterFilter;
    private final SecurityAuditLogger auditLogger;

    public AuthController(AuthApplicationService authService,
                          ClientRepositoryPort clientRepository,
                          ProviderRepositoryPort providerRepository,
                          LoginRateLimiterFilter rateLimiterFilter,
                          SecurityAuditLogger auditLogger) {
        this.authService = authService;
        this.clientRepository = clientRepository;
        this.providerRepository = providerRepository;
        this.rateLimiterFilter = rateLimiterFilter;
        this.auditLogger = auditLogger;
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Autentica un usuario con email y contraseña, retornando un token JWT Bearer.")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        String ip = extractIp(servletRequest);
        try {
            LoginResponse response = authService.login(request);
            rateLimiterFilter.resetAttempts(ip);
            auditLogger.logEvent("LOGIN_SUCCESS", request.email(), ip, true, "Inicio de sesión exitoso. Rol: " + response.role());
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            auditLogger.logEvent("LOGIN_FAILED", request.email(), ip, false, ex.getMessage());
            throw ex;
        }
    }

    @PostMapping("/register-client")
    @Operation(summary = "Registro de Cliente Natural/Empresa", description = "Registra una nueva cuenta de cliente con su perfil personal y genera un token JWT.")
    public ResponseEntity<LoginResponse> registerClient(@Valid @RequestBody RegisterClientRequest request) {
        LoginResponse response = authService.registerClient(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/register-provider")
    @Operation(summary = "Registro de Proveedor de Maquinaria", description = "Registra una empresa o contratista como proveedor y genera un token JWT.")
    public ResponseEntity<LoginResponse> registerProvider(@Valid @RequestBody RegisterProviderRequest request) {
        LoginResponse response = authService.registerProvider(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Perfil de la sesión actual", description = "Obtiene los datos del usuario autenticado, su rol y su identificador de cliente/proveedor.", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<Map<String, Object>> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserSummaryDto summary = authService.getCurrentUser(userDetails.getId());
        Map<String, Object> response = new HashMap<>();
        response.put("userId", summary.id());
        response.put("email", summary.email());
        response.put("role", summary.role());
        response.put("displayName", summary.profileName());
        response.put("active", summary.active());
        response.put("createdAt", summary.createdAt());

        // Adjuntar ID de perfil si existe
        clientRepository.findByUserId(summary.id()).ifPresent(c -> response.put("clientId", c.getId()));
        providerRepository.findByUserId(summary.id()).ifPresent(p -> response.put("providerId", p.getId()));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Cambiar contraseña de cuenta", description = "Permite al usuario autenticado modificar su contraseña actual por una nueva de alta entropía.")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request,
            HttpServletRequest servletRequest) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String ip = extractIp(servletRequest);
        authService.changePassword(userDetails.getId(), request);
        auditLogger.logEvent("PASSWORD_CHANGED", userDetails.getUsername(), ip, true, "Contraseña modificada exitosamente.");

        return ResponseEntity.ok(Map.of("message", "Contraseña actualizada exitosamente."));
    }

    private String extractIp(HttpServletRequest request) {
        if (request == null) return "UNKNOWN";
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
