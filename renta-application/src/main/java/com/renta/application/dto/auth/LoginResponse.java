package com.renta.application.dto.auth;

import com.renta.domain.model.enums.UserRole;

public record LoginResponse(
        String token,
        String tokenType,
        Long userId,
        String email,
        UserRole role,
        String name,
        long expiresIn
) {
    public static LoginResponse of(String token, Long userId, String email, UserRole role, String name, long expiresIn) {
        return new LoginResponse(token, "Bearer", userId, email, role, name, expiresIn);
    }
}
