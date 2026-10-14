package com.renta.infrastructure.config.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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

    // Filtro personalizado que intercepta cada petición para extraer y validar el token JWT
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    // Manejador que responde con HTTP 401 si alguien intenta entrar sin token
    private final RestAuthenticationEntryPoint authenticationEntryPoint;

    // Manejador que responde con HTTP 403 si un usuario autenticado intenta acceder a algo de otro rol
    private final RestAccessDeniedHandler accessDeniedHandler;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          RestAuthenticationEntryPoint authenticationEntryPoint,
                          RestAccessDeniedHandler accessDeniedHandler) {
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
                // 1. CORS: Permite peticiones desde el navegador (Cross-Origin Resource Sharing)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. CSRF: Se desactiva porque nuestra API es REST y usa tokens JWT en cabeceras,
                //    por lo que no usamos cookies de sesión y no somos vulnerables a ataques CSRF.
                .csrf(AbstractHttpConfigurer::disable)

                // 3. SESIÓN STATELESS (Sin Estado): El servidor no guarda sesiones en memoria RAM.
                //    Cada petición es independiente y debe traer su propio token JWT.
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. MANEJO DE ERRORES: Respuestas JSON limpias en formato estándar RFC 7807 (ProblemDetail)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint) // Error 401: No autenticado
                        .accessDeniedHandler(accessDeniedHandler)           // Error 403: Rol insuficiente
                )

                // 5. REGLAS DE AUTORIZACIÓN DE RUTAS (De lo más específico a lo general)
                .authorizeHttpRequests(auth -> auth
                        // --- RUTAS PÚBLICAS (No requieren login) ---
                        .requestMatchers("/api/v1/auth/**").permitAll()                           // Login y Registro
                        .requestMatchers(HttpMethod.GET, "/api/v1/tools/**").permitAll()           // Ver catálogo de herramientas
                        .requestMatchers(HttpMethod.POST, "/api/v1/reservations/calculate-price").permitAll() // Cotizador de precios
                        .requestMatchers(HttpMethod.GET, "/api/v1/reservations/tool/*/occupied-dates").permitAll() // Calendario de disponibilidad
                        .requestMatchers(HttpMethod.GET, "/api/v1/reviews/tool/**").permitAll()    // Reseñas de clientes

                        // --- DOCUMENTACIÓN SWAGGER / OPENAPI ---
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                        // --- ARCHIVOS ESTÁTICOS DE LA INTERFAZ WEB (HTML, JS, CSS) ---
                        .requestMatchers("/", "/index.html", "/favicon.ico", "/css/**", "/js/**", "/assets/**", "/static/**").permitAll()
                        .requestMatchers("/error").permitAll()

                        // --- RUTAS PROTEGIDAS POR ROL ---
                        .requestMatchers(HttpMethod.GET, "/api/v1/logistics/settlement/**").hasAnyRole("ADMIN", "CLIENTE", "PROVEEDOR")
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/provider/**").hasAnyRole("ADMIN", "PROVEEDOR")
                        .requestMatchers("/api/v1/client/**").hasAnyRole("ADMIN", "CLIENTE")

                        // --- CUALQUIER OTRA RUTA REQUIERE LOGIN ---
                        .anyRequest().authenticated()
                )

                // 6. AGREGAR NUESTRO FILTRO JWT: Se ejecuta ANTES del filtro estándar de usuario/contraseña
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * ENCRIPTADOR DE CONTRASEÑAS (BCrypt)
     * Nunca guardamos contraseñas en texto plano. Usamos BCrypt con un costo (salt) seguro.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
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
     * Permite que clientes web (frontend en JavaScript o Postman) puedan comunicarse
     * con la API sin que el navegador bloquee las solicitudes HTTP.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L); // 1 hora de caché para las respuestas de preflight OPTIONS

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
