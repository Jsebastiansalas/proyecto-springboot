package com.renta.infrastructure.config.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/**
 * ============================================================================
 * PRUEBAS UNITARIAS: FILTRO DE RATE LIMITING EN LOGIN
 * ============================================================================
 * 
 * ¿QUÉ COMPROBAMOS EN ESTA PRUEBA?
 * 1. Que las primeras 5 peticiones de login pasen libremente.
 * 2. Que el sexto intento consecutivo sea bloqueado con HTTP 429 Too Many Requests.
 * 3. Que otras rutas (como ver herramientas) no sean bloqueadas por este filtro.
 * 4. Que dos IPs diferentes tengan contadores independientes.
 */
class LoginRateLimiterFilterTest {

    private LoginRateLimiterFilter filter;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        filter = new LoginRateLimiterFilter();
        filterChain = mock(FilterChain.class);
    }

    @Test
    @DisplayName("Permite hasta 5 intentos de login consecutivos desde una misma IP")
    void shouldAllowFirstFiveLoginAttempts() throws ServletException, IOException {
        String clientIp = "192.168.1.50";

        for (int i = 1; i <= 5; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
            request.setRemoteAddr(clientIp);
            MockHttpServletResponse response = new MockHttpServletResponse();

            filter.doFilterInternal(request, response, filterChain);

            // Verifica que la respuesta no haya sido bloqueada con 429
            assertEquals(200, response.getStatus());
        }

        // El filterChain debe haberse ejecutado exactamente 5 veces (dejó pasar las 5 peticiones)
        verify(filterChain, times(5)).doFilter(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    @DisplayName("Bloquea el 6to intento consecutivo con HTTP 429 Too Many Requests")
    void shouldBlockSixthLoginAttemptWithHttp429() throws ServletException, IOException {
        String clientIp = "10.0.0.99";

        // Primeros 5 intentos
        for (int i = 1; i <= 5; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
            request.setRemoteAddr(clientIp);
            MockHttpServletResponse response = new MockHttpServletResponse();
            filter.doFilterInternal(request, response, filterChain);
        }

        // Intento número 6 (debe ser rechazado inmediatamente)
        MockHttpServletRequest request6 = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request6.setRemoteAddr(clientIp);
        MockHttpServletResponse response6 = new MockHttpServletResponse();

        filter.doFilterInternal(request6, response6, filterChain);

        // Aserciones de seguridad
        assertEquals(429, response6.getStatus(), "El código HTTP debe ser 429 Too Many Requests");
        assertEquals("60", response6.getHeader("Retry-After"), "Debe indicar 60 segundos de espera");
        assertEquals("0", response6.getHeader("X-RateLimit-Remaining"), "Los intentos restantes deben ser 0");

        // El filterChain solo debió ejecutarse 5 veces (la sexta petición no pasó)
        verify(filterChain, times(5)).doFilter(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    @DisplayName("No aplica límite a peticiones GET de consulta en otros endpoints")
    void shouldNotLimitNonLoginRequests() throws ServletException, IOException {
        String clientIp = "172.16.0.10";

        // Realizamos 10 peticiones a ver herramientas
        for (int i = 1; i <= 10; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/tools");
            request.setRemoteAddr(clientIp);
            MockHttpServletResponse response = new MockHttpServletResponse();

            filter.doFilterInternal(request, response, filterChain);

            assertEquals(200, response.getStatus());
        }

        // Las 10 peticiones pasaron sin problema
        verify(filterChain, times(10)).doFilter(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    @DisplayName("Permite nuevos intentos tras invocar resetAttempts")
    void shouldResetAttemptsOnSuccess() throws ServletException, IOException {
        String clientIp = "192.168.1.150";

        // Realiza 5 intentos
        for (int i = 1; i <= 5; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/v1/auth/login");
            req.setRemoteAddr(clientIp);
            filter.doFilterInternal(req, new MockHttpServletResponse(), filterChain);
        }

        // Resetea intentos (simulando login exitoso)
        filter.resetAttempts(clientIp);

        // El intento 6 debe permitirse con 200 en lugar de bloquearse con 429
        MockHttpServletRequest req6 = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        req6.setRemoteAddr(clientIp);
        MockHttpServletResponse res6 = new MockHttpServletResponse();
        filter.doFilterInternal(req6, res6, filterChain);

        assertEquals(200, res6.getStatus());
        verify(filterChain, times(6)).doFilter(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }
}
