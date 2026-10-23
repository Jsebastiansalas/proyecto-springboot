package com.renta.application.dto.user;

public record UserLockStatusResponse(
        Long userId,
        String email,
        boolean locked,
        String lockReason,
        String message
) {}
