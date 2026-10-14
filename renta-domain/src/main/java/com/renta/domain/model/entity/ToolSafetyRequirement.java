package com.renta.domain.model.entity;

import java.util.Objects;

/**
 * 4NF decoupled entity representing industrial safety and PPE requirements for operating a tool.
 */
public class ToolSafetyRequirement {
    private Long id;
    private Long toolId;
    private String requirementName;
    private String description;

    public ToolSafetyRequirement() {
    }

    public ToolSafetyRequirement(Long id, Long toolId, String requirementName, String description) {
        this.id = id;
        this.toolId = toolId;
        this.requirementName = requirementName;
        this.description = description;
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

    public String getRequirementName() {
        return requirementName;
    }

    public void setRequirementName(String requirementName) {
        this.requirementName = requirementName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ToolSafetyRequirement that)) return false;
        return Objects.equals(id, that.id) || (Objects.equals(toolId, that.toolId) && Objects.equals(requirementName, that.requirementName));
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, toolId, requirementName);
    }
}
