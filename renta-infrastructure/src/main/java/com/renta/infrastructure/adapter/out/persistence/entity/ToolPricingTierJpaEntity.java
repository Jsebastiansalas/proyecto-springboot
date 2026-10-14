package com.renta.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "tool_pricing_tiers")
public class ToolPricingTierJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tool_id", nullable = false)
    private ToolJpaEntity tool;

    @Column(name = "tier_type", nullable = false, length = 50)
    private String tierType;

    @Column(name = "min_days", nullable = false)
    private int minDays;

    @Column(name = "price_per_day", nullable = false, precision = 12, scale = 2)
    private BigDecimal pricePerDay;

    public ToolPricingTierJpaEntity() {}

    public ToolPricingTierJpaEntity(Long id, ToolJpaEntity tool, String tierType, int minDays, BigDecimal pricePerDay) {
        this.id = id;
        this.tool = tool;
        this.tierType = tierType;
        this.minDays = minDays;
        this.pricePerDay = pricePerDay;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ToolJpaEntity getTool() { return tool; }
    public void setTool(ToolJpaEntity tool) { this.tool = tool; }
    public String getTierType() { return tierType; }
    public void setTierType(String tierType) { this.tierType = tierType; }
    public int getMinDays() { return minDays; }
    public void setMinDays(int minDays) { this.minDays = minDays; }
    public BigDecimal getPricePerDay() { return pricePerDay; }
    public void setPricePerDay(BigDecimal pricePerDay) { this.pricePerDay = pricePerDay; }
}
