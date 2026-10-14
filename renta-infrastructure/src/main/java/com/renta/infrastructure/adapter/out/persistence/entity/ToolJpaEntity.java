package com.renta.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tools")
public class ToolJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "provider_id", nullable = false)
    private Long providerId;

    @Column(name = "category_id", nullable = false)
    private Integer categoryId;

    @Column(name = "code_sku", nullable = false, unique = true, length = 50)
    private String codeSku;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100)
    private String brand;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "base_daily_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal baseDailyPrice;

    @Column(name = "deposit_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal depositAmount;

    @Column(nullable = false, length = 30)
    private String status = "DISPONIBLE";

    @Column(name = "main_image_url", columnDefinition = "TEXT")
    private String mainImageUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    // Colecciones 4FN con carga perezosa y cascada
    @OneToMany(mappedBy = "tool", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ToolImageJpaEntity> images = new ArrayList<>();

    @OneToMany(mappedBy = "tool", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ToolSpecificationJpaEntity> specifications = new ArrayList<>();

    @OneToMany(mappedBy = "tool", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ToolPricingTierJpaEntity> pricingTiers = new ArrayList<>();

    @OneToMany(mappedBy = "tool", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ToolSafetyRequirementJpaEntity> safetyRequirements = new ArrayList<>();

    public ToolJpaEntity() {}

    public ToolJpaEntity(Long id, Long providerId, Integer categoryId, String codeSku, String name,
                         String brand, String model, String description, BigDecimal baseDailyPrice,
                         BigDecimal depositAmount, String status, String mainImageUrl,
                         Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.providerId = providerId;
        this.categoryId = categoryId;
        this.codeSku = codeSku;
        this.name = name;
        this.brand = brand;
        this.model = model;
        this.description = description;
        this.baseDailyPrice = baseDailyPrice;
        this.depositAmount = depositAmount;
        this.status = status != null ? status : "DISPONIBLE";
        this.mainImageUrl = mainImageUrl;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
        this.updatedAt = updatedAt != null ? updatedAt : Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }
    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }
    public String getCodeSku() { return codeSku; }
    public void setCodeSku(String codeSku) { this.codeSku = codeSku; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getBaseDailyPrice() { return baseDailyPrice; }
    public void setBaseDailyPrice(BigDecimal baseDailyPrice) { this.baseDailyPrice = baseDailyPrice; }
    public BigDecimal getDepositAmount() { return depositAmount; }
    public void setDepositAmount(BigDecimal depositAmount) { this.depositAmount = depositAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getMainImageUrl() { return mainImageUrl; }
    public void setMainImageUrl(String mainImageUrl) { this.mainImageUrl = mainImageUrl; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public List<ToolImageJpaEntity> getImages() { return images; }
    public void setImages(List<ToolImageJpaEntity> images) { this.images = images; }
    public List<ToolSpecificationJpaEntity> getSpecifications() { return specifications; }
    public void setSpecifications(List<ToolSpecificationJpaEntity> specifications) { this.specifications = specifications; }
    public List<ToolPricingTierJpaEntity> getPricingTiers() { return pricingTiers; }
    public void setPricingTiers(List<ToolPricingTierJpaEntity> pricingTiers) { this.pricingTiers = pricingTiers; }
    public List<ToolSafetyRequirementJpaEntity> getSafetyRequirements() { return safetyRequirements; }
    public void setSafetyRequirements(List<ToolSafetyRequirementJpaEntity> safetyRequirements) { this.safetyRequirements = safetyRequirements; }
}
