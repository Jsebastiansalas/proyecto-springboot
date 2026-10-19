package com.renta.domain.model.entity;

import java.time.Instant;
import java.util.Objects;

/**
 * Domain entity representing a technical question or user comment on a tool specification (4FN).
 */
public class ToolComment {

    private Long id;
    private Long toolId;
    private Long userId;
    private String authorName;
    private String authorRole;
    private String commentText;
    private String providerReply;
    private Instant repliedAt;
    private Instant createdAt;

    public ToolComment() {
    }

    public ToolComment(Long id, Long toolId, Long userId, String authorName, String authorRole,
                       String commentText, String providerReply, Instant repliedAt, Instant createdAt) {
        this.id = id;
        this.toolId = toolId;
        this.userId = userId;
        this.authorName = authorName;
        this.authorRole = authorRole;
        this.commentText = commentText;
        this.providerReply = providerReply;
        this.repliedAt = repliedAt;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
    }

    public static ToolComment create(Long toolId, Long userId, String authorName, String authorRole, String commentText) {
        return new ToolComment(null, toolId, userId, authorName, authorRole, commentText, null, null, Instant.now());
    }

    public void addReply(String reply, Instant repliedAt) {
        this.providerReply = reply;
        this.repliedAt = repliedAt != null ? repliedAt : Instant.now();
    }

    public boolean hasReply() {
        return this.providerReply != null && !this.providerReply.trim().isEmpty();
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

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getAuthorRole() {
        return authorRole;
    }

    public void setAuthorRole(String authorRole) {
        this.authorRole = authorRole;
    }

    public String getCommentText() {
        return commentText;
    }

    public void setCommentText(String commentText) {
        this.commentText = commentText;
    }

    public String getProviderReply() {
        return providerReply;
    }

    public void setProviderReply(String providerReply) {
        this.providerReply = providerReply;
    }

    public Instant getRepliedAt() {
        return repliedAt;
    }

    public void setRepliedAt(Instant repliedAt) {
        this.repliedAt = repliedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ToolComment that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "ToolComment{" +
                "id=" + id +
                ", toolId=" + toolId +
                ", author='" + authorName + '\'' +
                ", hasReply=" + hasReply() +
                '}';
    }
}
