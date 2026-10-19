package com.renta.domain.port.out;

import com.renta.domain.model.entity.ToolComment;

import java.util.List;
import java.util.Optional;

/**
 * Output port for managing tool comments and questions in persistence (4FN).
 */
public interface ToolCommentRepositoryPort {

    ToolComment save(ToolComment comment);

    Optional<ToolComment> findById(Long id);

    List<ToolComment> findByToolId(Long toolId);
}
