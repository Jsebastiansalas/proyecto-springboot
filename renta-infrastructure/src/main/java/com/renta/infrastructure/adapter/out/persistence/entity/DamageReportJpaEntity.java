package com.renta.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "damage_reports")
public class DamageReportJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "return_id", nullable = false)
    private Long returnId;

    @Column(name = "reported_by", nullable = false, length = 150)
    private String reportedBy;

    @Column(name = "damage_type", nullable = false, length = 100)
    private String damageType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "repair_cost_estimate", nullable = false, precision = 12, scale = 2)
    private BigDecimal repairCostEstimate;

    @Column(nullable = false, length = 30)
    private String status = "EVALUANDO";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public DamageReportJpaEntity() {}

    public DamageReportJpaEntity(Long id, Long returnId, String reportedBy, String damageType,
                                 String description, BigDecimal repairCostEstimate, String status, Instant createdAt) {
        this.id = id;
        this.returnId = returnId;
        this.reportedBy = reportedBy;
        this.damageType = damageType;
        this.description = description;
        this.repairCostEstimate = repairCostEstimate;
        this.status = status != null ? status : "EVALUANDO";
        this.createdAt = createdAt != null ? createdAt : Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getReturnId() { return returnId; }
    public void setReturnId(Long returnId) { this.returnId = returnId; }
    public String getReportedBy() { return reportedBy; }
    public void setReportedBy(String reportedBy) { this.reportedBy = reportedBy; }
    public String getDamageType() { return damageType; }
    public void setDamageType(String damageType) { this.damageType = damageType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getRepairCostEstimate() { return repairCostEstimate; }
    public void setRepairCostEstimate(BigDecimal repairCostEstimate) { this.repairCostEstimate = repairCostEstimate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
