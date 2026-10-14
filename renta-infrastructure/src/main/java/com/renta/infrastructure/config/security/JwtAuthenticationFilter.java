package com.renta.infrastructure.config.security;

import com.renta.infrastructure.adapter.out.security.CustomUserDetailsService;
import com.renta.infrastructure.adapter.out.security.JwtTokenProviderAdapter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * ============================================================================
 * FILTRO DE AUTENTICACIÓN JWT (OncePerRequestFilter)
 * ============================================================================
 * 
 * ¿QUÉ HACE ESTE FILTRO?
 * Se ejecuta EXACTAMENTE UNA VEZ por cada petición HTTP que llega a nuestro servidor.
 * 
 * FLUJO PASO A PASO:
 * 1. Lee la cabecera HTTP: 'Authorization: Bearer eyJhbGciOiJIUz...'
 * 2. Si no viene el token, deja pasar la petición (las rutas públicas funcionarán,
 *    las privadas serán frenadas luego por SecurityConfig con un 401).
 * 3. Si viene el token, valida su firma criptográfica y que no haya expirado.
 * 4. Extrae el correo electrónico guardado dentro del token.
 * 5. Carga los roles del usuario desde la base de datos.
 * 6. Registra al usuario en el 'SecurityContextHolder' de Spring Security para
 *    que los Controllers sepan quién está haciendo la llamada.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProviderAdapter jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtTokenProviderAdapter jwtTokenProvider,
                                   CustomUserDetailsService userDetailsService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        
        // PASO 1: Extraer el token de la cabecera HTTP "Authorization"
        String token = resolveToken(request);

        // PASO 2: Validar si el texto no está vacío y si el token es matemáticamente válido
        if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
            
            // PASO 3: Obtener el email del usuario desde el interior del JWT
            String email = jwtTokenProvider.getEmailFromToken(token);

            // PASO 4: Cargar la información completa del usuario (roles, estado activo)
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            // PASO 5: Si el usuario existe y está habilitado en el sistema...
            if (userDetails != null && userDetails.isEnabled()) {
                
                // Creamos el objeto oficial de autenticación de Spring con sus roles
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // PASO 6: Avisarle a Spring Security que este usuario está autenticado
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        // PASO 7: Continuar con el siguiente filtro en la cadena
        filterChain.doFilter(request, response);
    }

    /**
     * Extrae el token eliminando el prefijo "Bearer ".
     * Ejemplo: "Bearer eyJhbG..." -> "eyJhbG..."
     */
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
