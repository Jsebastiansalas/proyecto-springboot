package com.renta.application.service;

import com.renta.application.dto.auth.ChangePasswordRequest;
import com.renta.application.port.out.PasswordEncoderPort;
import com.renta.application.port.out.TokenProviderPort;
import com.renta.domain.exception.BusinessRuleViolationException;
import com.renta.domain.exception.InvalidCredentialsException;
import com.renta.domain.exception.ResourceNotFoundException;
import com.renta.domain.model.entity.User;
import com.renta.domain.model.enums.UserRole;
import com.renta.domain.model.vo.Email;
import com.renta.domain.port.out.ClientRepositoryPort;
import com.renta.domain.port.out.ProviderRepositoryPort;
import com.renta.domain.port.out.UserRepositoryPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ChangePasswordTest {

    private UserRepositoryPort userRepository;
    private ClientRepositoryPort clientRepository;
    private ProviderRepositoryPort providerRepository;
    private PasswordEncoderPort passwordEncoder;
    private TokenProviderPort tokenProvider;
    private AuthApplicationService authService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepositoryPort.class);
        clientRepository = mock(ClientRepositoryPort.class);
        providerRepository = mock(ProviderRepositoryPort.class);
        passwordEncoder = mock(PasswordEncoderPort.class);
        tokenProvider = mock(TokenProviderPort.class);
        authService = new AuthApplicationService(
                userRepository,
                clientRepository,
                providerRepository,
                passwordEncoder,
                tokenProvider
        );
    }

    @Test
    @DisplayName("Cambio de contraseña exitoso cuando las credenciales son correctas")
    void changePasswordSuccess() {
        Long userId = 1L;
        User user = User.create(Email.of("cliente1@correo.com"), "oldEncodedHash", 3, UserRole.ROLE_CLIENTE);
        user.setId(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("OldPassword123*", "oldEncodedHash")).thenReturn(true);
        when(passwordEncoder.matches("NewStrongPass#2026", "oldEncodedHash")).thenReturn(false);
        when(passwordEncoder.encode("NewStrongPass#2026")).thenReturn("newEncodedHash");

        ChangePasswordRequest request = new ChangePasswordRequest(
                "OldPassword123*",
                "NewStrongPass#2026",
                "NewStrongPass#2026"
        );

        authService.changePassword(userId, request);

        verify(userRepository).save(user);
        assertTrue(user.getPasswordHash().equals("newEncodedHash"));
    }

    @Test
    @DisplayName("Falla si la confirmación no coincide con la nueva clave")
    void changePasswordFailsWhenConfirmDoesNotMatch() {
        Long userId = 1L;
        User user = User.create(Email.of("cliente1@correo.com"), "oldHash", 3, UserRole.ROLE_CLIENTE);
        user.setId(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        ChangePasswordRequest request = new ChangePasswordRequest(
                "OldPassword123*",
                "NewStrongPass#2026",
                "DifferentPass#2026"
        );

        assertThrows(BusinessRuleViolationException.class, () -> authService.changePassword(userId, request));
    }

    @Test
    @DisplayName("Falla con InvalidCredentialsException si la contraseña actual es errónea")
    void changePasswordFailsWhenCurrentPasswordIsWrong() {
        Long userId = 1L;
        User user = User.create(Email.of("cliente1@correo.com"), "oldHash", 3, UserRole.ROLE_CLIENTE);
        user.setId(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPass123*", "oldHash")).thenReturn(false);

        ChangePasswordRequest request = new ChangePasswordRequest(
                "WrongPass123*",
                "NewStrongPass#2026",
                "NewStrongPass#2026"
        );

        assertThrows(InvalidCredentialsException.class, () -> authService.changePassword(userId, request));
    }

    @Test
    @DisplayName("Falla si la nueva contraseña es idéntica a la actual")
    void changePasswordFailsWhenNewPasswordIsSameAsCurrent() {
        Long userId = 1L;
        User user = User.create(Email.of("cliente1@correo.com"), "currentHash", 3, UserRole.ROLE_CLIENTE);
        user.setId(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("CurrentPass123*", "currentHash")).thenReturn(true);

        ChangePasswordRequest request = new ChangePasswordRequest(
                "CurrentPass123*",
                "CurrentPass123*",
                "CurrentPass123*"
        );

        assertThrows(BusinessRuleViolationException.class, () -> authService.changePassword(userId, request));
    }
}
