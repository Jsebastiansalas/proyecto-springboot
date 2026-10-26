package com.renta.application.dto.notification;

import java.time.Instant;

public record UserNotificationResponse(
        Long id,
        Long userId,
        String title,
        String message,
        String type,
        boolean read,
        String linkUrl,
        Instant createdAt
) {}
