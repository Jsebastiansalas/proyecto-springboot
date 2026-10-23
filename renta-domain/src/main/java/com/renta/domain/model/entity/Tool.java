package com.renta.domain.model.entity;

import com.renta.domain.model.enums.ToolStatus;
import com.renta.domain.model.vo.Money;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * ============================================================================
 * RAÍZ DE AGREGADO (AGGREGATE ROOT): HERRAMIENTA O MAQUINARIA (Tool)
 * ============================================================================
 * 
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Es la entidad principal del catálogo de inventario. Encapsula:
 * 1. Datos descriptivos: código SKU, nombre, marca, modelo y categoría.
 * 2. Reglas de cobro: tarifa base diaria y depósito de fianza (Value Objects {@link Money}).
 * 3. Ciclo de vida operativo: estado {@link ToolStatus} (DISPONIBLE, EN_ALQUILER, EN_MANTENIMIENTO).
 * 4. Descomposición en Cuarta Forma Normal (4FN):
 *    - `images`: Colección de fotografías de inspección técnica.
 *    - `specifications`: Atributos técnicos normalizados (potencia, combustible, peso).
 *    - `pricingTiers`: Escalas de precios según duración (diaria, semanal, mensual).
 *    - `safetyRequirements`: Normas de seguridad y EPP exigidos para su manipulación.
 * 
 * ¿POR QUÉ NO TIENE ANOTACIONES DE JPA COMO @Entity O @Table?
 * Porque pertenece al módulo `renta-domain` (Java puro sin dependencias de frameworks).
 * Su mapeo a la base de datos relacional se realiza en el adaptador de persistencia
 * de `renta-infrastructure`, cumpliendo con la pureza arquitectónica de DDD.
 */
public class Tool {
    private Long id;
    private Long providerId;
    private Integer categoryId;
    private String codeSku;
    private String name;
    private String brand;
    private String model;
    private String description;
    private Money baseDailyPrice;
    private Money depositAmount;
    private ToolStatus status = ToolStatus.DISPONIBLE;
    private Integer stockQuantity = 1;
    private String mainImageUrl;
    private Instant createdAt;
    private Instant updatedAt;

    // 4NF Decoupled Collections
    private final List<ToolImage> images = new ArrayList<>();
    private final List<ToolSpecification> specifications = new ArrayList<>();
    private final List<ToolPricingTier> pricingTiers = new ArrayList<>();
    private final List<ToolSafetyRequirement> safetyRequirements = new ArrayList<>();

    public Tool() {
    }

    public Tool(Long id, Long providerId, Integer categoryId, String codeSku, String name,
                String brand, String model, String description, Money baseDailyPrice,
                Money depositAmount, ToolStatus status, String mainImageUrl,
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
        this.status = status != null ? status : ToolStatus.DISPONIBLE;
        this.mainImageUrl = mainImageUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Tool(Long id, Long providerId, Integer categoryId, String codeSku, String name,
                String brand, String model, String description, BigDecimal baseDailyPrice,
                BigDecimal depositAmount, ToolStatus status, String mainImageUrl,
                Instant createdAt, Instant updatedAt) {
        this(id, providerId, categoryId, codeSku, name, brand, model, description,
                baseDailyPrice != null ? Money.cop(baseDailyPrice) : null,
                depositAmount != null ? Money.cop(depositAmount) : Money.zero(),
                status, mainImageUrl, createdAt, updatedAt);
    }

    public static Tool create(Long providerId, Integer categoryId, String codeSku, String name,
                              String brand, String model, String description,
                              Money baseDailyPrice, Money depositAmount) {
        Instant now = Instant.now();
        return new Tool(null, providerId, categoryId, codeSku, name, brand, model, description,
                baseDailyPrice, depositAmount != null ? depositAmount : Money.zero(),
                ToolStatus.DISPONIBLE, null, now, now);
    }

    // Domain Invariants and Operations

    public boolean isAvailable() {
        return status != null && status.isAvailable();
    }

    public boolean isInMaintenance() {
        return status == ToolStatus.MANTENIMIENTO;
    }

    public void markInMaintenance() {
        this.status = ToolStatus.MANTENIMIENTO;
        this.updatedAt = Instant.now();
    }

    public void markAvailable() {
        this.status = ToolStatus.DISPONIBLE;
        this.updatedAt = Instant.now();
    }

    public void markRented() {
        this.status = ToolStatus.EN_USO;
        this.updatedAt = Instant.now();
    }

    public void markRetired() {
        this.status = ToolStatus.RETIRADA;
        this.updatedAt = Instant.now();
    }

    // Child Collections Management

    public List<ToolImage> getImages() {
        return Collections.unmodifiableList(images);
    }

    public void addImage(ToolImage image) {
        if (image != null) {
            image.setToolId(this.id);
            images.add(image);
        }
    }

    public void addAllImages(List<ToolImage> newImages) {
        if (newImages != null) {
            for (ToolImage img : newImages) {
                addImage(img);
            }
        }
    }

    public void clearImages() {
        this.images.clear();
    }

    public List<ToolSpecification> getSpecifications() {
        return Collections.unmodifiableList(specifications);
    }

    public void addSpecification(ToolSpecification spec) {
        if (spec != null) {
            spec.setToolId(this.id);
            specifications.add(spec);
        }
    }

    public void addAllSpecifications(List<ToolSpecification> specs) {
        if (specs != null) {
            for (ToolSpecification s : specs) {
                addSpecification(s);
            }
        }
    }

    public void clearSpecifications() {
        this.specifications.clear();
    }

    public List<ToolPricingTier> getPricingTiers() {
        return Collections.unmodifiableList(pricingTiers);
    }

    public void addPricingTier(ToolPricingTier tier) {
        if (tier != null) {
            tier.setToolId(this.id);
            pricingTiers.add(tier);
        }
    }

    public void addAllPricingTiers(List<ToolPricingTier> tiers) {
        if (tiers != null) {
            for (ToolPricingTier t : tiers) {
                addPricingTier(t);
            }
        }
    }

    public void clearPricingTiers() {
        this.pricingTiers.clear();
    }

    public List<ToolSafetyRequirement> getSafetyRequirements() {
        return Collections.unmodifiableList(safetyRequirements);
    }

    public void addSafetyRequirement(ToolSafetyRequirement req) {
        if (req != null) {
            req.setToolId(this.id);
            safetyRequirements.add(req);
        }
    }

    public void addAllSafetyRequirements(List<ToolSafetyRequirement> reqs) {
        if (reqs != null) {
            for (ToolSafetyRequirement r : reqs) {
                addSafetyRequirement(r);
            }
        }
    }

    public void clearSafetyRequirements() {
        this.safetyRequirements.clear();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProviderId() {
        return providerId;
    }

    public void setProviderId(Long providerId) {
        this.providerId = providerId;
    }

    public Integer getStockQuantity() {
        return stockQuantity != null ? stockQuantity : 1;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity != null && stockQuantity > 0 ? stockQuantity : 1;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public String getCodeSku() {
        return codeSku;
    }

    public void setCodeSku(String codeSku) {
        this.codeSku = codeSku;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Money getBaseDailyPrice() {
        return baseDailyPrice;
    }

    public void setBaseDailyPrice(Money baseDailyPrice) {
        this.baseDailyPrice = baseDailyPrice;
    }

    public void setBaseDailyPrice(BigDecimal baseDailyPrice) {
        this.baseDailyPrice = baseDailyPrice != null ? Money.cop(baseDailyPrice) : null;
    }

    public Money getDepositAmount() {
        return depositAmount;
    }

    public void setDepositAmount(Money depositAmount) {
        this.depositAmount = depositAmount;
    }

    public void setDepositAmount(BigDecimal depositAmount) {
        this.depositAmount = depositAmount != null ? Money.cop(depositAmount) : Money.zero();
    }

    public ToolStatus getStatus() {
        return status;
    }

    public void setStatus(ToolStatus status) {
        this.status = status;
    }

    public String getMainImageUrl() {
        return mainImageUrl;
    }

    public void setMainImageUrl(String mainImageUrl) {
        this.mainImageUrl = mainImageUrl;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Tool tool)) return false;
        return Objects.equals(id, tool.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Tool{" + "id=" + id + ", sku='" + codeSku + '\'' + ", name='" + name + '\'' + ", status=" + status + '}';
    }
}
