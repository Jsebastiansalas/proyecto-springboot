package com.renta.application.dto.auth;

import com.renta.domain.model.enums.UserRole;

import java.time.Instant;

public record UserSummaryDto(
        Long id,
        String email,
        UserRole role,
        boolean active,
        String profileName,
        Instant createdAt
) {}
