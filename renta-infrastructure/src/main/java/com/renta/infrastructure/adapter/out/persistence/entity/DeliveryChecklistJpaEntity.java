package com.renta.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "delivery_technical_checklists")
public class DeliveryChecklistJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "delivery_id", nullable = false, unique = true)
    private Long deliveryId;

    @Column(name = "cables_inspected", nullable = false)
    private boolean cablesInspected = true;

    @Column(name = "safety_guards_ok", nullable = false)
    private boolean safetyGuardsOk = true;

    @Column(name = "retie_certified", nullable = false)
    private boolean retieCertified = true;

    @Column(name = "fluids_level_ok", nullable = false)
    private boolean fluidsLevelOk = true;

    @Column(name = "operator_ppe_kit_included", nullable = false)
    private boolean operatorPpeKitIncluded = true;

    @Column(name = "inspector_signature", nullable = false, length = 150)
    private String inspectorSignature = "Inspector Técnico de Patio";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public DeliveryChecklistJpaEntity() {}

    public DeliveryChecklistJpaEntity(
            Long deliveryId,
            boolean cablesInspected,
            boolean safetyGuardsOk,
            boolean retieCertified,
            boolean fluidsLevelOk,
            boolean operatorPpeKitIncluded,
            String inspectorSignature) {
        this.deliveryId = deliveryId;
        this.cablesInspected = cablesInspected;
        this.safetyGuardsOk = safetyGuardsOk;
        this.retieCertified = retieCertified;
        this.fluidsLevelOk = fluidsLevelOk;
        this.operatorPpeKitIncluded = operatorPpeKitIncluded;
        this.inspectorSignature = inspectorSignature != null ? inspectorSignature : "Inspector Técnico de Patio";
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDeliveryId() { return deliveryId; }
    public void setDeliveryId(Long deliveryId) { this.deliveryId = deliveryId; }

    public boolean isCablesInspected() { return cablesInspected; }
    public void setCablesInspected(boolean cablesInspected) { this.cablesInspected = cablesInspected; }

    public boolean isSafetyGuardsOk() { return safetyGuardsOk; }
    public void setSafetyGuardsOk(boolean safetyGuardsOk) { this.safetyGuardsOk = safetyGuardsOk; }

    public boolean isRetieCertified() { return retieCertified; }
    public void setRetieCertified(boolean retieCertified) { this.retieCertified = retieCertified; }

    public boolean isFluidsLevelOk() { return fluidsLevelOk; }
    public void setFluidsLevelOk(boolean fluidsLevelOk) { this.fluidsLevelOk = fluidsLevelOk; }

    public boolean isOperatorPpeKitIncluded() { return operatorPpeKitIncluded; }
    public void setOperatorPpeKitIncluded(boolean operatorPpeKitIncluded) { this.operatorPpeKitIncluded = operatorPpeKitIncluded; }

    public String getInspectorSignature() { return inspectorSignature; }
    public void setInspectorSignature(String inspectorSignature) { this.inspectorSignature = inspectorSignature; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
