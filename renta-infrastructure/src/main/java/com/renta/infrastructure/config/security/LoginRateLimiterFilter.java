package com.renta.infrastructure.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URI;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * ============================================================================
 * FILTRO DE SEGURIDAD: RATE LIMITING PARA LOGIN (PROTECCIÓN FUERZA BRUTA)
 * ============================================================================
 * 
 * ¿QUÉ PROBLEMA RESUELVE ESTA CLASE?
 * Un atacante malintencionado podría crear un script que pruebe millones de
 * contraseñas por segundo contra nuestro endpoint `POST /api/v1/auth/login`.
 * Esto se conoce como un ataque de "Fuerza Bruta" o ataque de Denegación de Servicio (DoS).
 * 
 * ¿CÓMO LO SOLUCIONA?
 * 1. Cuenta cuántas veces una misma dirección IP intenta iniciar sesión en un minuto.
 * 2. Si la IP supera el límite permitido (máximo 5 intentos por minuto),
 *    la petición se bloquea INMEDIATAMENTE antes de consultar la base de datos.
 * 3. Responde con el código HTTP oficial para exceso de peticiones:
 *    HTTP 429 "Too Many Requests" (Demasiadas Peticiones).
 * 4. Incluye la cabecera estándar 'Retry-After: 60' indicándole al cliente cuántos
 *    segundos debe esperar antes de volver a intentar.
 * 
 * ¿POR QUÉ USAMOS ConcurrentHashMap?
 * En un servidor web como Tomcat, múltiples usuarios hacen peticiones al mismo tiempo
 * (en diferentes hilos o "threads"). Usar un HashMap normal causaría errores de concurrencia.
 * ConcurrentHashMap garantiza que múltiples hilos puedan leer y escribir contadores de forma segura.
 */
@Component
public class LoginRateLimiterFilter extends OncePerRequestFilter {

    // Configuración: Máximo 5 intentos de inicio de sesión por ventana de 60 segundos
    public static final int MAX_ATTEMPTS = 5;
    public static final long WINDOW_DURATION_MILLIS = 60_000L; // 1 minuto en milisegundos

    // Almacén en memoria: Asocia cada Dirección IP con su contador de intentos
    private final Map<String, IpAttemptTracker> attemptsByIp = new ConcurrentHashMap<>();

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        // Solo aplicamos el límite al intentar iniciar sesión (POST /api/v1/auth/login)
        if (isLoginRequest(request)) {
            String clientIp = extractClientIp(request);

            // Verificamos si la IP excedió el límite permitido
            if (isRateLimited(clientIp)) {
                // Bloqueamos la petición con HTTP 429
                sendRateLimitExceededResponse(request, response);
                return; // Cortamos el flujo aquí: la petición NO llega al Controller ni a la base de datos
            }
        }

        // Si no es login o la IP aún tiene intentos disponibles, dejamos pasar la petición normalmente
        filterChain.doFilter(request, response);
    }

    /**
     * PASO 1: Identificar si la solicitud es el endpoint de login
     */
    private boolean isLoginRequest(HttpServletRequest request) {
        return "POST".equalsIgnoreCase(request.getMethod()) &&
                request.getRequestURI().endsWith("/api/v1/auth/login");
    }

    /**
     * PASO 2: Obtener la IP real del cliente (incluso si está detrás de un proxy como Nginx o Cloudflare)
     */
    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            // Si viene una lista de IPs ("192.168.1.1, 10.0.0.1"), tomamos la primera que es la original
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * PASO 3: Registrar el intento y verificar si superó los 5 intentos en el último minuto
     */
    private synchronized boolean isRateLimited(String clientIp) {
        long now = System.currentTimeMillis();
        IpAttemptTracker tracker = attemptsByIp.get(clientIp);

        // Si es la primera vez que esta IP intenta o si la ventana de 1 minuto ya venció:
        if (tracker == null || (now - tracker.windowStartTime > WINDOW_DURATION_MILLIS)) {
            // Reiniciamos el contador a 1 intento con nueva ventana de tiempo
            attemptsByIp.put(clientIp, new IpAttemptTracker(1, now));
            return false;
        }

        // Si todavía estamos dentro del mismo minuto:
        tracker.attemptCount++;
        return tracker.attemptCount > MAX_ATTEMPTS;
    }

    /**
     * PASO 4: Enviar respuesta HTTP 429 Too Many Requests bajo estándar RFC 7807
     */
    private void sendRateLimitExceededResponse(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value()); // Código 429
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.setHeader("Retry-After", "60"); // Indica que debe esperar 60 segundos
        response.setHeader("X-RateLimit-Limit", String.valueOf(MAX_ATTEMPTS));
        response.setHeader("X-RateLimit-Remaining", "0");

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.TOO_MANY_REQUESTS,
                "Demasiados intentos de inicio de sesión desde esta dirección IP. Por favor espere 1 minuto antes de volver a intentarlo."
        );
        problem.setTitle("Límite de peticiones excedido (Rate Limit)");
        problem.setType(URI.create("urn:problem-type:too-many-requests"));
        problem.setInstance(URI.create(request.getRequestURI()));
        problem.setProperty("timestamp", Instant.now().toString());
        problem.setProperty("retryAfterSeconds", 60);

        objectMapper.writeValue(response.getOutputStream(), problem);
    }

    /**
     * Resetea el contador de intentos para una IP específica (ej. tras un login exitoso).
     */
    public synchronized void resetAttempts(String clientIp) {
        if (clientIp != null) {
            attemptsByIp.remove(clientIp);
        }
    }

    /**
     * Clase auxiliar sencilla para guardar el conteo y la hora de inicio de cada IP
     */
    private static class IpAttemptTracker {
        int attemptCount;
        long windowStartTime;

        IpAttemptTracker(int attemptCount, long windowStartTime) {
            this.attemptCount = attemptCount;
            this.windowStartTime = windowStartTime;
        }
    }
}
