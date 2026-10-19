package com.renta.infrastructure.adapter.out.persistence;

import com.renta.domain.model.entity.ToolComment;
import com.renta.domain.port.out.ToolCommentRepositoryPort;
import com.renta.infrastructure.adapter.out.persistence.entity.ToolCommentJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataToolCommentRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class ToolCommentRepositoryAdapter implements ToolCommentRepositoryPort {

    private final SpringDataToolCommentRepository repository;

    public ToolCommentRepositoryAdapter(SpringDataToolCommentRepository repository) {
        this.repository = repository;
    }

    @Override
    public ToolComment save(ToolComment domain) {
        ToolCommentJpaEntity entity = toJpa(domain);
        ToolCommentJpaEntity saved = repository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<ToolComment> findById(Long id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public List<ToolComment> findByToolId(Long toolId) {
        return repository.findByToolIdOrderByCreatedAtDesc(toolId).stream().map(this::toDomain).toList();
    }

    private ToolComment toDomain(ToolCommentJpaEntity e) {
        if (e == null) return null;
        return new ToolComment(
                e.getId(),
                e.getToolId(),
                e.getUserId(),
                e.getAuthorName(),
                e.getAuthorRole(),
                e.getCommentText(),
                e.getProviderReply(),
                e.getRepliedAt(),
                e.getCreatedAt()
        );
    }

    private ToolCommentJpaEntity toJpa(ToolComment d) {
        if (d == null) return null;
        return new ToolCommentJpaEntity(
                d.getId(),
                d.getToolId(),
                d.getUserId(),
                d.getAuthorName(),
                d.getAuthorRole(),
                d.getCommentText(),
                d.getProviderReply(),
                d.getRepliedAt(),
                d.getCreatedAt()
        );
    }
}
