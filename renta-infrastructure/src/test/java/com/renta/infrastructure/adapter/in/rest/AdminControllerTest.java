package com.renta.infrastructure.adapter.in.rest;

import com.renta.application.dto.auth.UserSummaryDto;
import com.renta.application.port.in.AuthUseCase;
import com.renta.domain.model.entity.Provider;
import com.renta.domain.model.enums.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * ============================================================================
 * PRUEBAS UNITARIAS: CONTROLADOR DE ADMINISTRACIÓN (AdminControllerTest)
 * ============================================================================
 * 
 * GUÍA DIDÁCTICA PARA DESARROLLADOR JUNIOR:
 * 1. ¿Qué es @ExtendWith(MockitoExtension.class)?
 *    Le dice a JUnit 5 que habilite la librería Mockito para crear objetos simulados (Mocks).
 * 
 * 2. ¿Qué es @Mock?
 *    Crea una versión simulada de la interfaz `AuthUseCase`. Al simular una interfaz
 *    (Puerto de Entrada en Arquitectura Hexagonal), cumplimos el Principio de Inversión
 *    de Dependencias (DIP) y las pruebas son ultra rápidas y limpias.
 * 
 * 3. ¿Qué es @InjectMocks?
 *    Le inyecta el Mock simulado al constructor de nuestro `AdminController`.
 */
@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

    @Mock
    private AuthUseCase authService;

    @InjectMocks
    private AdminController adminController;

    private UserSummaryDto testUser;
    private Provider testProvider;

    @BeforeEach
    void setUp() {
        testUser = new UserSummaryDto(
                1L,
                "admin@renta.com",
                UserRole.ROLE_ADMIN,
                true,
                "Administrador Principal",
                Instant.now()
        );

        testProvider = new Provider(
                10L,
                2L,
                "Equipos del Norte S.A.S.",
                "Carlos Gómez",
                "901234567-8",
                "3001234567",
                "Calle 100 # 15-20",
                "Bogotá",
                true,
                Instant.now()
        );
    }

    @Test
    @DisplayName("HU-03: listAllUsers retorna lista de usuarios y código 200 OK")
    void shouldListAllUsersSuccessfully() {
        // GIVEN (Dado que el servicio retorna una lista con nuestro usuario simulado)
        when(authService.listAllUsers()).thenReturn(List.of(testUser));

        // WHEN (Cuando el controlador recibe la petición)
        ResponseEntity<List<UserSummaryDto>> response = adminController.listAllUsers();

        // THEN (Entonces verificamos que la respuesta sea 200 OK y contenga los datos)
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals("admin@renta.com", response.getBody().get(0).email());
        verify(authService, times(1)).listAllUsers();
    }

    @Test
    @DisplayName("HU-03: toggleUserStatus suspende o activa cuenta y retorna 204 No Content")
    void shouldToggleUserStatusSuccessfully() {
        // WHEN
        ResponseEntity<Void> response = adminController.toggleUserStatus(1L, false);

        // THEN
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(authService, times(1)).toggleUserStatus(1L, false);
    }

    @Test
    @DisplayName("HU-03: listAllProviders retorna empresas proveedoras y código 200 OK")
    void shouldListAllProvidersSuccessfully() {
        // GIVEN
        when(authService.listAllProviders()).thenReturn(List.of(testProvider));

        // WHEN
        ResponseEntity<List<Provider>> response = adminController.listAllProviders();

        // THEN
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals("Equipos del Norte S.A.S.", response.getBody().get(0).getCompanyName());
        verify(authService, times(1)).listAllProviders();
    }

    @Test
    @DisplayName("HU-03: verifyProvider aprueba o suspende verificación y retorna 204 No Content")
    void shouldVerifyProviderSuccessfully() {
        // WHEN
        ResponseEntity<Void> response = adminController.verifyProvider(10L, true);

        // THEN
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(authService, times(1)).verifyProvider(10L, true);
    }
}
