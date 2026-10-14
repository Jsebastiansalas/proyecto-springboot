package com.renta.domain.model.entity;

import java.util.Objects;

/**
 * 4NF decoupled entity representing an itemized key-value technical specification for a tool.
 */
public class ToolSpecification {
    private Long id;
    private Long toolId;
    private String specName;
    private String specValue;

    public ToolSpecification() {
    }

    public ToolSpecification(Long id, Long toolId, String specName, String specValue) {
        this.id = id;
        this.toolId = toolId;
        this.specName = specName;
        this.specValue = specValue;
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

    public String getSpecName() {
        return specName;
    }

    public void setSpecName(String specName) {
        this.specName = specName;
    }

    public String getSpecValue() {
        return specValue;
    }

    public void setSpecValue(String specValue) {
        this.specValue = specValue;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ToolSpecification that)) return false;
        return Objects.equals(id, that.id) || (Objects.equals(toolId, that.toolId) && Objects.equals(specName, that.specName));
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, toolId, specName);
    }
}
