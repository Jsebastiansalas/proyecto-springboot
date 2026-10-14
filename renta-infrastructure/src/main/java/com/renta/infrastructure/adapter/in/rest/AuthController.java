package com.renta.infrastructure.adapter.in.rest;

import com.renta.application.dto.auth.LoginRequest;
import com.renta.application.dto.auth.LoginResponse;
import com.renta.application.dto.auth.RegisterClientRequest;
import com.renta.application.dto.auth.RegisterProviderRequest;
import com.renta.application.dto.auth.UserSummaryDto;
import com.renta.application.service.AuthApplicationService;
import com.renta.domain.port.out.ClientRepositoryPort;
import com.renta.domain.port.out.ProviderRepositoryPort;
import com.renta.infrastructure.adapter.out.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "1. Autenticación y Cuentas", description = "Endpoints públicos de inicio de sesión y registro de clientes/proveedores")
public class AuthController {

    private final AuthApplicationService authService;
    private final ClientRepositoryPort clientRepository;
    private final ProviderRepositoryPort providerRepository;

    public AuthController(AuthApplicationService authService,
                          ClientRepositoryPort clientRepository,
                          ProviderRepositoryPort providerRepository) {
        this.authService = authService;
        this.clientRepository = clientRepository;
        this.providerRepository = providerRepository;
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Autentica un usuario con email y contraseña, retornando un token JWT Bearer.")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
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
}
