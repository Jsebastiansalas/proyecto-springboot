package com.renta.application.port.in;

import com.renta.application.dto.auth.LoginRequest;
import com.renta.application.dto.auth.LoginResponse;
import com.renta.application.dto.auth.RegisterClientRequest;
import com.renta.application.dto.auth.RegisterProviderRequest;
import com.renta.application.dto.auth.UserSummaryDto;
import com.renta.domain.model.entity.Provider;

import java.util.List;

/**
 * ============================================================================
 * CASO DE USO DE AUTENTICACIÓN Y GESTIÓN DE CUENTAS (AuthUseCase)
 * ============================================================================
 * 
 * Contrato de entrada para operaciones de inicio de sesión, registro,
 * consulta de usuarios y verificación de proveedores.
 */
public interface AuthUseCase {

    LoginResponse login(LoginRequest request);

    LoginResponse registerClient(RegisterClientRequest request);

    LoginResponse registerProvider(RegisterProviderRequest request);

    UserSummaryDto getCurrentUser(Long userId);

    List<UserSummaryDto> listAllUsers();

    void toggleUserStatus(Long userId, boolean active);

    List<Provider> listAllProviders();

    void verifyProvider(Long providerId, boolean verified);

    void changePassword(Long userId, com.renta.application.dto.auth.ChangePasswordRequest request);
}
