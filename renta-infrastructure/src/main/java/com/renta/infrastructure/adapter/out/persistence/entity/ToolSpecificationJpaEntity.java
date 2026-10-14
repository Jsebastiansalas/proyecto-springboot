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

@Entity
@Table(name = "tool_specifications")
public class ToolSpecificationJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tool_id", nullable = false)
    private ToolJpaEntity tool;

    @Column(name = "spec_name", nullable = false, length = 100)
    private String specName;

    @Column(name = "spec_value", nullable = false, length = 255)
    private String specValue;

    public ToolSpecificationJpaEntity() {}

    public ToolSpecificationJpaEntity(Long id, ToolJpaEntity tool, String specName, String specValue) {
        this.id = id;
        this.tool = tool;
        this.specName = specName;
        this.specValue = specValue;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ToolJpaEntity getTool() { return tool; }
    public void setTool(ToolJpaEntity tool) { this.tool = tool; }
    public String getSpecName() { return specName; }
    public void setSpecName(String specName) { this.specName = specName; }
    public String getSpecValue() { return specValue; }
    public void setSpecValue(String specValue) { this.specValue = specValue; }
}
