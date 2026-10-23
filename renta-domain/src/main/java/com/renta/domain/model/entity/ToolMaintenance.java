package com.renta.domain.model.entity;

import com.renta.domain.exception.BusinessRuleViolationException;
import com.renta.domain.model.enums.MaintenanceStatus;
import com.renta.domain.model.enums.MaintenanceType;
import com.renta.domain.model.vo.Money;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;

/**
 * ============================================================================
 * ENTIDAD DE DOMINIO: MANTENIMIENTO DE MAQUINARIA (ToolMaintenance)
 * ============================================================================
 * Registra la hoja de vida técnica, calibraciones y averías mecánicas.
 */
public class ToolMaintenance {

    private Long id;
    private Long toolId;
    private MaintenanceType type;
    private LocalDate startDate;
    private LocalDate endDate;
    private Money cost;
    private String technicianName;
    private String description;
    private MaintenanceStatus status;
    private Instant createdAt;

    public ToolMaintenance() {
    }

    public ToolMaintenance(Long id, Long toolId, MaintenanceType type, LocalDate startDate,
                           LocalDate endDate, Money cost, String technicianName,
                           String description, MaintenanceStatus status, Instant createdAt) {
        this.id = id;
        this.toolId = Objects.requireNonNull(toolId, "El toolId es obligatorio");
        this.type = type != null ? type : MaintenanceType.PREVENTIVO;
        this.startDate = Objects.requireNonNull(startDate, "La fecha de inicio es obligatoria");
        this.endDate = endDate;
        this.cost = cost != null ? cost : Money.zero();
        this.technicianName = technicianName;
        this.description = description;
        this.status = status != null ? status : MaintenanceStatus.EN_PROCESO;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
    }

    public void complete(LocalDate actualEndDate, Money finalCost, String notes) {
        if (this.status == MaintenanceStatus.COMPLETADO) {
            throw new BusinessRuleViolationException("El mantenimiento ya fue completado previamente.");
        }
        this.endDate = actualEndDate != null ? actualEndDate : LocalDate.now();
        if (finalCost != null) {
            this.cost = finalCost;
        }
        if (notes != null && !notes.isBlank()) {
            this.description = (this.description != null ? this.description + " | " : "") + "Cierre: " + notes;
        }
        this.status = MaintenanceStatus.COMPLETADO;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getToolId() { return toolId; }
    public void setToolId(Long toolId) { this.toolId = toolId; }

    public MaintenanceType getType() { return type; }
    public void setType(MaintenanceType type) { this.type = type; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Money getCost() { return cost; }
    public void setCost(Money cost) { this.cost = cost; }

    public String getTechnicianName() { return technicianName; }
    public void setTechnicianName(String technicianName) { this.technicianName = technicianName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public MaintenanceStatus getStatus() { return status; }
    public void setStatus(MaintenanceStatus status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
