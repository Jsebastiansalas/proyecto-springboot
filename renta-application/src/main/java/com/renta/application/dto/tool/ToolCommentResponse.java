package com.renta.application.dto.tool;

import java.time.Instant;

public record ToolCommentResponse(
        Long id,
        Long toolId,
        Long userId,
        String authorName,
        String authorRole,
        String commentText,
        String providerReply,
        Instant repliedAt,
        Instant createdAt
) {}
