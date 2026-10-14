package com.renta.application.port.out;

import com.renta.domain.model.enums.UserRole;

/**
 * Puerto de salida para generación de tokens de autenticación JWT.
 */
public interface TokenProviderPort {

    String generateToken(Long userId, String email, UserRole role);

    long getExpirationMillis();
}
