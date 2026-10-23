package com.renta.application.dto.maintenance;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ToolMaintenanceResponse(
        Long id,
        Long toolId,
        String toolName,
        String toolSku,
        String maintenanceType,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal cost,
        String technicianName,
        String description,
        String status,
        String message
) {
}
