package com.renta.application.service;

import com.renta.application.dto.tool.ToolCommentResponse;
import com.renta.domain.exception.BusinessRuleViolationException;
import com.renta.domain.exception.ResourceNotFoundException;
import com.renta.domain.model.entity.ToolComment;
import com.renta.domain.port.out.ToolCommentRepositoryPort;
import com.renta.domain.port.out.ToolRepositoryPort;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

/**
 * ============================================================================
 * SERVICIO DE APLICACIÓN: PREGUNTAS Y COMENTARIOS EN EL CATÁLOGO (Q&A)
 * ============================================================================
 * 
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Gestiona el sistema de preguntas y respuestas técnicas tipo Amazon/MercadoLibre:
 * 1. Permite a los clientes hacer preguntas sobre una herramienta antes de alquilarla.
 * 2. Permite a los proveedores o administradores responder a las dudas técnicas.
 * 3. Consulta el hilo de comentarios y respuestas ordenados cronológicamente.
 * 
 * ¿POR QUÉ ESTÁ CREADO Y DÓNDE ENCAJA EN LA ARQUITECTURA?
 * En la Arquitectura Hexagonal, encapsula la lógica de comunicación bidireccional
 * cliente-proveedor dentro de la capa de aplicación sin depender de tecnologías web.
 */
public class ToolCommentApplicationService {

    private final ToolCommentRepositoryPort commentRepository;
    private final ToolRepositoryPort toolRepository;

    public ToolCommentApplicationService(
            ToolCommentRepositoryPort commentRepository,
            ToolRepositoryPort toolRepository) {
        this.commentRepository = Objects.requireNonNull(commentRepository);
        this.toolRepository = Objects.requireNonNull(toolRepository);
    }

    public List<ToolCommentResponse> getCommentsByToolId(Long toolId) {
        return commentRepository.findByToolId(toolId).stream()
                .map(this::toResponse)
                .toList();
    }

    public ToolCommentResponse postComment(Long toolId, Long userId, String authorName, String authorRole, String commentText) {
        toolRepository.findById(toolId)
                .orElseThrow(() -> new ResourceNotFoundException("Herramienta no encontrada con ID: " + toolId));

        if (commentText == null || commentText.trim().isEmpty()) {
            throw new BusinessRuleViolationException("El comentario o pregunta no puede estar vacío");
        }

        ToolComment comment = ToolComment.create(
                toolId,
                userId,
                authorName != null ? authorName : "Usuario",
                authorRole != null ? authorRole : "CLIENTE",
                commentText.trim()
        );
        ToolComment saved = commentRepository.save(comment);
        return toResponse(saved);
    }

    public ToolCommentResponse replyComment(Long commentId, String replyText) {
        ToolComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comentario no encontrado con ID: " + commentId));

        if (replyText == null || replyText.trim().isEmpty()) {
            throw new BusinessRuleViolationException("La respuesta del proveedor no puede estar vacía");
        }

        comment.addReply(replyText.trim(), Instant.now());
        ToolComment saved = commentRepository.save(comment);
        return toResponse(saved);
    }

    private ToolCommentResponse toResponse(ToolComment c) {
        return new ToolCommentResponse(
                c.getId(),
                c.getToolId(),
                c.getUserId(),
                c.getAuthorName(),
                c.getAuthorRole(),
                c.getCommentText(),
                c.getProviderReply(),
                c.getRepliedAt(),
                c.getCreatedAt()
        );
    }
}
