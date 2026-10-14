package com.renta.application.dto.tool;

public record CategoryResponse(
        Integer id,
        String name,
        String description,
        String iconName
) {}
