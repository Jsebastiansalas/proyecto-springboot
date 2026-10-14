package com.renta.domain.model.entity;

import com.renta.domain.model.enums.PricingTierType;
import com.renta.domain.model.vo.Money;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * 4NF decoupled entity representing pricing rules conditioned on rental duration.
 */
public class ToolPricingTier {
    private Long id;
    private Long toolId;
    private PricingTierType tierType;
    private int minDays;
    private Money pricePerDay;

    public ToolPricingTier() {
    }

    public ToolPricingTier(Long id, Long toolId, PricingTierType tierType, int minDays, Money pricePerDay) {
        this.id = id;
        this.toolId = toolId;
        this.tierType = tierType;
        this.minDays = minDays;
        this.pricePerDay = pricePerDay;
    }

    public ToolPricingTier(Long id, Long toolId, PricingTierType tierType, int minDays, BigDecimal pricePerDay) {
        this(id, toolId, tierType, minDays, pricePerDay != null ? Money.cop(pricePerDay) : null);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getToolId() {
        return toolId;
    }

    public void setToolId(Long toolId) {
        this.toolId = toolId;
    }

    public PricingTierType getTierType() {
        return tierType;
    }

    public void setTierType(PricingTierType tierType) {
        this.tierType = tierType;
    }

    public int getMinDays() {
        return minDays;
    }

    public void setMinDays(int minDays) {
        this.minDays = minDays;
    }

    public Money getPricePerDay() {
        return pricePerDay;
    }

    public void setPricePerDay(Money pricePerDay) {
        this.pricePerDay = pricePerDay;
    }

    public void setPricePerDay(BigDecimal pricePerDay) {
        this.pricePerDay = pricePerDay != null ? Money.cop(pricePerDay) : null;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ToolPricingTier that)) return false;
        return Objects.equals(id, that.id) || (Objects.equals(toolId, that.toolId) && tierType == that.tierType);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, toolId, tierType);
    }
}
