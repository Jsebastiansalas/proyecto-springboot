package com.renta.infrastructure.config.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * ============================================================================
 * CONFIGURACIÓN DE SEGURIDAD (SPRING SECURITY 6 + JWT)
 * ============================================================================
 * 
 * ¿QUÉ HACE ESTA CLASE?
 * Esta clase es el "guardia de seguridad" de toda nuestra aplicación. Define:
 * 1. Qué rutas son públicas (cualquiera puede verlas sin iniciar sesión).
 * 2. Qué rutas son privadas y requieren un token JWT válido.
 * 3. Qué roles (ADMIN, CLIENTE, PROVEEDOR) pueden acceder a cada endpoint.
 * 4. Cómo se manejan las contraseñas (BCrypt) y cómo se validan los tokens.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Permite usar anotaciones como @PreAuthorize("hasRole('ADMIN')") en los Controllers
public class SecurityConfig {

    // Filtro personalizado de Rate Limiting para evitar ataques de fuerza bruta en el login
    private final LoginRateLimiterFilter loginRateLimiterFilter;

    // Filtro personalizado que intercepta cada petición para extraer y validar el token JWT
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    // Manejador que responde con HTTP 401 si alguien intenta entrar sin token
    private final RestAuthenticationEntryPoint authenticationEntryPoint;

    // Manejador que responde con HTTP 403 si un usuario autenticado intenta acceder a algo de otro rol
    private final RestAccessDeniedHandler accessDeniedHandler;

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:8080,http://127.0.0.1:5173,http://127.0.0.1:8080}")
    private String allowedOrigins;

    public SecurityConfig(LoginRateLimiterFilter loginRateLimiterFilter,
                          JwtAuthenticationFilter jwtAuthenticationFilter,
                          RestAuthenticationEntryPoint authenticationEntryPoint,
                          RestAccessDeniedHandler accessDeniedHandler) {
        this.loginRateLimiterFilter = loginRateLimiterFilter;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
    }

    /**
     * CADENA PRINCIPAL DE FILTROS DE SEGURIDAD (SecurityFilterChain)
     * 
     * Cada petición HTTP que llega al servidor pasa por esta cadena de reglas en orden:
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. CORS: Permite peticiones desde orígenes autorizados
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. CABECERAS DE SEGURIDAD OWASP (Protección Clickjacking, XSS, MIME Sniffing, Referrer, CSP, HSTS)
                .headers(headers -> headers
                        .frameOptions(frame -> frame.sameOrigin())
                        .contentTypeOptions(Customizer.withDefaults())
                        .xssProtection(Customizer.withDefaults())
                        .referrerPolicy(referrer -> referrer.policy(ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                        .permissionsPolicyHeader(permissions -> permissions.policy("camera=(), microphone=(), geolocation=()"))
                        .contentSecurityPolicy(csp -> csp.policyDirectives(
                                "default-src 'self'; " +
                                "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; " +
                                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                                "font-src 'self' https://fonts.gstatic.com; " +
                                "img-src 'self' data: https:; " +
                                "connect-src 'self';"
                        ))
                        .httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .maxAgeInSeconds(31536000)
                                .requestMatcher(request -> true)
                        )
                )

                // 3. CSRF: Se desactiva porque nuestra API es REST y usa tokens JWT en cabeceras,
                //    por lo que no usamos cookies de sesión y no somos vulnerables a ataques CSRF.
                .csrf(AbstractHttpConfigurer::disable)

                // 4. SESIÓN STATELESS (Sin Estado): El servidor no guarda sesiones en memoria RAM.
                //    Cada petición es independiente y debe traer su propio token JWT.
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 5. MANEJO DE ERRORES: Respuestas JSON limpias en formato estándar RFC 7807 (ProblemDetail)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint) // Error 401: No autenticado
                        .accessDeniedHandler(accessDeniedHandler)           // Error 403: Rol insuficiente
                )

                // 6. REGLAS DE AUTORIZACIÓN DE RUTAS (De lo más específico a lo general)
                .authorizeHttpRequests(auth -> auth
                        // --- RUTAS PÚBLICAS (No requieren login) ---
                        .requestMatchers("/api/v1/auth/**").permitAll()                           // Login y Registro
                        .requestMatchers(HttpMethod.GET, "/api/v1/tools/**").permitAll()           // Ver catálogo de herramientas
                        .requestMatchers(HttpMethod.POST, "/api/v1/reservations/calculate-price").permitAll() // Cotizador de precios
                        .requestMatchers(HttpMethod.GET, "/api/v1/reservations/tool/*/occupied-dates").permitAll() // Calendario de disponibilidad
                        .requestMatchers(HttpMethod.GET, "/api/v1/reviews/tool/**").permitAll()    // Reseñas de clientes

                        // --- SPRING BOOT ACTUATOR (Monitoreo y Salud del Sistema) ---
                        // /actuator/health e /info son públicos para que Docker/Kubernetes verifiquen el estado
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        // /actuator/metrics y otros endpoints de auditoría requieren permisos de ADMINISTRADOR
                        .requestMatchers("/actuator/**").hasRole("ADMIN")

                        // --- DOCUMENTACIÓN SWAGGER / OPENAPI ---
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                        // --- ARCHIVOS ESTÁTICOS DE LA INTERFAZ WEB (HTML, JS, CSS, IMÁGENES) ---
                        .requestMatchers("/", "/index.html", "/favicon.ico", "/css/**", "/js/**", "/images/**", "/assets/**", "/static/**").permitAll()
                        .requestMatchers("/error").permitAll()

                        // --- NOTIFICACIONES Y SIMULACIÓN ---
                        .requestMatchers(HttpMethod.POST, "/api/v1/notifications/simulate").hasRole("ADMIN")
                        .requestMatchers("/api/v1/notifications/**").authenticated()

                        // --- RUTAS PROTEGIDAS POR ROL: ADMINISTRADOR ---
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/reports/admin").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/reservations").hasRole("ADMIN")

                        // --- RUTAS PROTEGIDAS POR ROL: PROVEEDOR & ADMIN ---
                        .requestMatchers(HttpMethod.POST, "/api/v1/tools").hasAnyRole("ADMIN", "PROVEEDOR")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/tools/**").hasAnyRole("ADMIN", "PROVEEDOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/tools/**").hasAnyRole("ADMIN", "PROVEEDOR")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/tools/*/status").hasAnyRole("ADMIN", "PROVEEDOR")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/tools/comments/*/reply").hasAnyRole("ADMIN", "PROVEEDOR")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/reservations/*/approve").hasAnyRole("ADMIN", "PROVEEDOR")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/reservations/*/reject").hasAnyRole("ADMIN", "PROVEEDOR")
                        .requestMatchers(HttpMethod.POST, "/api/v1/deliveries").hasAnyRole("ADMIN", "PROVEEDOR")
                        .requestMatchers(HttpMethod.POST, "/api/v1/returns").hasAnyRole("ADMIN", "PROVEEDOR")
                        .requestMatchers(HttpMethod.POST, "/api/v1/damages").hasAnyRole("ADMIN", "PROVEEDOR")
                        .requestMatchers(HttpMethod.GET, "/api/v1/reports/provider/**").hasAnyRole("ADMIN", "PROVEEDOR")

                        // --- RUTAS PROTEGIDAS POR ROL: CLIENTE & ADMIN ---
                        .requestMatchers(HttpMethod.POST, "/api/v1/reservations").hasAnyRole("ADMIN", "CLIENTE")
                        .requestMatchers(HttpMethod.POST, "/api/v1/payments/**").hasAnyRole("ADMIN", "CLIENTE")

                        // --- RUTAS GENERALES AUTENTICADAS ---
                        .requestMatchers(HttpMethod.GET, "/api/v1/logistics/settlement/**").hasAnyRole("ADMIN", "CLIENTE", "PROVEEDOR")
                        .requestMatchers(HttpMethod.GET, "/api/v1/invoices/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/reservations/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/reservations/*/cancel").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/damages/**").authenticated()

                        // --- CUALQUIER OTRA RUTA REQUIERE LOGIN ---
                        .anyRequest().authenticated()
                )

                // 7. FILTRO DE RATE LIMITING: Bloquea intentos excesivos de login por IP (HTTP 429)
                .addFilterBefore(loginRateLimiterFilter, UsernamePasswordAuthenticationFilter.class)

                // 8. FILTRO JWT: Valida el token del usuario y establece la autenticación
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * ENCRIPTADOR DE CONTRASEÑAS (BCrypt)
     * Configurado con costo 12 (4096 iteraciones de salt) para máxima resistencia criptográfica.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    /**
     * ADMINISTRADOR DE AUTENTICACIÓN DE SPRING
     * Es el componente oficial de Spring Security encargado de coordinar la validación de credenciales.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    /**
     * CONFIGURACIÓN DE CORS (Cross-Origin Resource Sharing)
     * Restringe las solicitudes a orígenes explícitos y seguros (Vite en 5173, Tomcat/Spring en 8080)
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With", "Origin"));
        config.setExposedHeaders(List.of("Authorization", "Content-Disposition"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L); // 1 hora de caché para las respuestas de preflight OPTIONS

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
