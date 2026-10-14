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
@Table(name = "tool_images")
public class ToolImageJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tool_id", nullable = false)
    private ToolJpaEntity tool;

    @Column(name = "image_url", nullable = false, columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "is_primary", nullable = false)
    private boolean primary = false;

    @Column(length = 200)
    private String caption;

    public ToolImageJpaEntity() {}

    public ToolImageJpaEntity(Long id, ToolJpaEntity tool, String imageUrl, boolean primary, String caption) {
        this.id = id;
        this.tool = tool;
        this.imageUrl = imageUrl;
        this.primary = primary;
        this.caption = caption;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ToolJpaEntity getTool() { return tool; }
    public void setTool(ToolJpaEntity tool) { this.tool = tool; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public boolean isPrimary() { return primary; }
    public void setPrimary(boolean primary) { this.primary = primary; }
    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }
}
