package com.renta.domain.model.entity;

import com.renta.domain.model.enums.DamageReportStatus;
import com.renta.domain.model.enums.DamageType;
import com.renta.domain.model.vo.Money;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * Domain entity representing an equipment damage, breakdown, or missing accessory report.
 */
public class DamageReport {
    private Long id;
    private Long returnId;
    private String reportedBy;
    private DamageType damageType;
    private String description;
    private Money repairCostEstimate;
    private DamageReportStatus status = DamageReportStatus.EVALUANDO;
    private Instant createdAt;

    public DamageReport() {
    }

    public DamageReport(Long id, Long returnId, String reportedBy, DamageType damageType,
                        String description, Money repairCostEstimate, DamageReportStatus status,
                        Instant createdAt) {
        this.id = id;
        this.returnId = returnId;
        this.reportedBy = reportedBy;
        this.damageType = damageType;
        this.description = description;
        this.repairCostEstimate = repairCostEstimate != null ? repairCostEstimate : Money.zero();
        this.status = status != null ? status : DamageReportStatus.EVALUANDO;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
    }

    public DamageReport(Long id, Long returnId, String reportedBy, DamageType damageType,
                        String description, BigDecimal repairCostEstimate, DamageReportStatus status,
                        Instant createdAt) {
        this(id, returnId, reportedBy, damageType, description,
                repairCostEstimate != null ? Money.cop(repairCostEstimate) : Money.zero(),
                status, createdAt);
    }

    public static DamageReport create(Long returnId, String reportedBy, DamageType damageType,
                                      String description, Money repairCostEstimate) {
        return new DamageReport(null, returnId, reportedBy, damageType, description,
                repairCostEstimate, DamageReportStatus.EVALUANDO, Instant.now());
    }

    public void markBilled() {
        this.status = DamageReportStatus.COBRADO;
    }

    public void forgive() {
        this.status = DamageReportStatus.CONDONADO;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getReturnId() {
        return returnId;
    }

    public void setReturnId(Long returnId) {
        this.returnId = returnId;
    }

    public String getReportedBy() {
        return reportedBy;
    }

    public void setReportedBy(String reportedBy) {
        this.reportedBy = reportedBy;
    }

    public DamageType getDamageType() {
        return damageType;
    }

    public void setDamageType(DamageType damageType) {
        this.damageType = damageType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Money getRepairCostEstimate() {
        return repairCostEstimate;
    }

    public void setRepairCostEstimate(Money repairCostEstimate) {
        this.repairCostEstimate = repairCostEstimate;
    }

    public void setRepairCostEstimate(BigDecimal repairCostEstimate) {
        this.repairCostEstimate = repairCostEstimate != null ? Money.cop(repairCostEstimate) : Money.zero();
    }

    public DamageReportStatus getStatus() {
        return status;
    }

    public void setStatus(DamageReportStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DamageReport that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "DamageReport{" + "id=" + id + ", type=" + damageType + ", cost=" + repairCostEstimate + '}';
    }
}
