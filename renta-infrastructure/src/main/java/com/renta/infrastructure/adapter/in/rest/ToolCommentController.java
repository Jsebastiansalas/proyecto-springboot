package com.renta.infrastructure.adapter.in.rest;

import com.renta.application.dto.tool.CreateToolCommentRequest;
import com.renta.application.dto.tool.ReplyToolCommentRequest;
import com.renta.application.dto.tool.ToolCommentResponse;
import com.renta.application.service.ToolCommentApplicationService;
import com.renta.domain.model.entity.User;
import com.renta.domain.port.out.UserRepositoryPort;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tools")
@Tag(name = "2. Catálogo de Maquinaria y Equipos", description = "Consultas, comentarios técnicos y especificaciones normalizadas de herramientas")
public class ToolCommentController {

    private final ToolCommentApplicationService commentService;
    private final UserRepositoryPort userRepository;

    public ToolCommentController(ToolCommentApplicationService commentService, UserRepositoryPort userRepository) {
        this.commentService = commentService;
        this.userRepository = userRepository;
    }

    @GetMapping("/{toolId}/comments")
    @Operation(summary = "Listar preguntas y comentarios de un equipo", description = "Obtiene el muro de preguntas y respuestas oficiales para una herramienta determinada.")
    public ResponseEntity<List<ToolCommentResponse>> getComments(@PathVariable Long toolId) {
        return ResponseEntity.ok(commentService.getCommentsByToolId(toolId));
    }

    @PostMapping("/{toolId}/comments")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Publicar pregunta o comentario técnico", description = "Permite a cualquier usuario autenticado dejar una consulta en la ficha técnica del equipo.")
    public ResponseEntity<ToolCommentResponse> postComment(
            @PathVariable Long toolId,
            @Valid @RequestBody CreateToolCommentRequest request) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth != null ? auth.getName() : "anonimo@correo.com";

        Long userId = 1L;
        String authorName = "Contratista";
        String authorRole = "CLIENTE";

        var userOpt = userRepository.findByEmail(new com.renta.domain.model.vo.Email(email));
        if (userOpt.isPresent()) {
            User u = userOpt.get();
            userId = u.getId();
            authorRole = u.getRole() != null ? u.getRole().name().replace("ROLE_", "") : "CLIENTE";
            authorName = email.split("@")[0];
        }

        ToolCommentResponse resp = commentService.postComment(toolId, userId, authorName, authorRole, request.commentText());
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PatchMapping("/comments/{commentId}/reply")
    @PreAuthorize("hasAnyRole('PROVEEDOR', 'ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Responder oficialmente a un comentario técnico", description = "Permite al proveedor dueño del equipo o administrador responder a una consulta técnica.")
    public ResponseEntity<ToolCommentResponse> replyComment(
            @PathVariable Long commentId,
            @Valid @RequestBody ReplyToolCommentRequest request) {
        return ResponseEntity.ok(commentService.replyComment(commentId, request.providerReply()));
    }
}
