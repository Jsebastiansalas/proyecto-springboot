package com.renta.domain.model.entity;

import java.util.Objects;

/**
 * 4NF decoupled entity representing an image in a tool's multimedia gallery.
 */
public class ToolImage {
    private Long id;
    private Long toolId;
    private String imageUrl;
    private boolean primary;
    private String caption;

    public ToolImage() {
    }

    public ToolImage(Long id, Long toolId, String imageUrl, boolean primary, String caption) {
        this.id = id;
        this.toolId = toolId;
        this.imageUrl = imageUrl;
        this.primary = primary;
        this.caption = caption;
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public boolean isPrimary() {
        return primary;
    }

    public void setPrimary(boolean primary) {
        this.primary = primary;
    }

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ToolImage that)) return false;
        return Objects.equals(id, that.id) || (Objects.equals(toolId, that.toolId) && Objects.equals(imageUrl, that.imageUrl));
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, toolId, imageUrl);
    }
}
