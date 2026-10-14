package com.renta.infrastructure.adapter.out.security;

import com.renta.application.port.out.TokenProviderPort;
import com.renta.domain.model.enums.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * ============================================================================
 * PROVEEDOR DE TOKENS JWT (JSON Web Tokens)
 * ============================================================================
 * 
 * ¿QUÉ ES UN JWT?
 * Es una credencial digital en texto codificado que consta de 3 partes separadas por puntos (A.B.C):
 * 1. HEADER (Encabezado): Algoritmo de firma (ej: HMAC SHA-256).
 * 2. PAYLOAD (Cuerpo / Reclamos): Datos del usuario (id, email, rol, fecha expiración).
 * 3. SIGNATURE (Firma Criptográfica): Sello que garantiza que nadie alteró el contenido.
 * 
 * ESTA CLASE REALIZA 3 TAREAS:
 * 1. Crear el token cuando el usuario inicia sesión correctamente (generateToken).
 * 2. Verificar que el token sea auténtico y no haya expirado (validateToken).
 * 3. Extraer información del usuario desde el token (getEmail, getRole, getUserId).
 */
@Component
public class JwtTokenProviderAdapter implements TokenProviderPort {

    // Clave secreta con la que firmamos y verificamos los tokens
    private final SecretKey key;

    // Tiempo de vida del token en milisegundos (24 horas por defecto = 86,400,000 ms)
    private final long expirationMillis;

    public JwtTokenProviderAdapter(
            @Value("${jwt.secret:RentaHerramientasClaveSuperSeguraJWT2026ConMasDe256BitsParaHS256Firmado!}") String secret,
            @Value("${jwt.expiration-millis:86400000}") long expirationMillis) {
        // Generamos la clave criptográfica a partir del secreto en texto
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMillis = expirationMillis;
    }

    /**
     * GENERAR TOKEN: Se llama al iniciar sesión exitosamente.
     */
    @Override
    public String generateToken(Long userId, String email, UserRole role) {
        Date ahora = new Date();
        Date fechaExpiracion = new Date(ahora.getTime() + expirationMillis);

        return Jwts.builder()
                .subject(email)                 // Identificador principal (correo)
                .claim("userId", userId)         // Campo personalizado: ID del usuario
                .claim("role", role.name())      // Campo personalizado: Rol (ROLE_CLIENTE, etc.)
                .issuedAt(ahora)                 // Fecha de emisión
                .expiration(fechaExpiracion)     // Fecha de vencimiento
                .signWith(key)                   // Firma con nuestra clave secreta
                .compact();                      // Serializa a texto (Base64Url)
    }

    @Override
    public long getExpirationMillis() {
        return expirationMillis;
    }

    /**
     * VALIDAR TOKEN: Verifica si la firma es auténtica y si el token aún no ha vencido.
     */
    public boolean validateToken(String token) {
        try {
            // Si el token es inválido, adulterado o expiró, parseSignedClaims lanzará una excepción
            getClaims(token);
            return true;
        } catch (Exception ex) {
            // El token no es válido o ya caducó
            return false;
        }
    }

    /**
     * Obtiene el email guardado en el "subject" del token.
     */
    public String getEmailFromToken(String token) {
        return getClaims(token).getSubject();
    }

    /**
     * Obtiene el rol (ROLE_ADMIN, ROLE_PROVEEDOR, ROLE_CLIENTE) guardado en el token.
     */
    public String getRoleFromToken(String token) {
        return getClaims(token).get("role", String.class);
    }

    /**
     * Obtiene el ID numérico del usuario guardado en el token.
     */
    public Long getUserIdFromToken(String token) {
        return getClaims(token).get("userId", Long.class);
    }

    /**
     * MÉTODO AUXILIAR: Decodifica y verifica la firma del token una sola vez.
     */
    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
