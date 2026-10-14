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
@Table(name = "tool_safety_requirements")
public class ToolSafetyRequirementJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tool_id", nullable = false)
    private ToolJpaEntity tool;

    @Column(name = "requirement_name", nullable = false, length = 150)
    private String requirementName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    public ToolSafetyRequirementJpaEntity() {}

    public ToolSafetyRequirementJpaEntity(Long id, ToolJpaEntity tool, String requirementName, String description) {
        this.id = id;
        this.tool = tool;
        this.requirementName = requirementName;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ToolJpaEntity getTool() { return tool; }
    public void setTool(ToolJpaEntity tool) { this.tool = tool; }
    public String getRequirementName() { return requirementName; }
    public void setRequirementName(String requirementName) { this.requirementName = requirementName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
