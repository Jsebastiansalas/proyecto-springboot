package com.renta.infrastructure.adapter.in.rest;

import com.renta.infrastructure.adapter.out.external.ConsoleNotificationAdapter;
import com.renta.infrastructure.adapter.out.external.ConsoleNotificationAdapter.InAppNotification;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@PreAuthorize("isAuthenticated()")
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Notificaciones In-App", description = "Centro de notificaciones y alertas en tiempo real (HU-11)")
public class NotificationController {

    private final ConsoleNotificationAdapter notificationAdapter;

    public NotificationController(ConsoleNotificationAdapter notificationAdapter) {
        this.notificationAdapter = notificationAdapter;
    }

    @GetMapping
    @Operation(summary = "Listar notificaciones recientes del usuario")
    public ResponseEntity<List<InAppNotification>> getNotifications() {
        return ResponseEntity.ok(notificationAdapter.getNotifications());
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Marcar notificación como leída")
    public ResponseEntity<Map<String, String>> markAsRead(@PathVariable String id) {
        notificationAdapter.markAsRead(id);
        return ResponseEntity.ok(Map.of("message", "Notificación marcada como leída"));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Marcar todas las notificaciones como leídas")
    public ResponseEntity<Map<String, String>> markAllAsRead() {
        notificationAdapter.markAllAsRead();
        return ResponseEntity.ok(Map.of("message", "Todas las notificaciones fueron marcadas como leídas"));
    }

    @PostMapping("/simulate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Simular una notificación del sistema (Pruebas - Solo ADMIN)")
    public ResponseEntity<Map<String, String>> simulateNotification(@RequestBody(required = false) Map<String, Object> payload) {
        String title = payload != null && payload.get("title") != null ? payload.get("title").toString() : "Alerta de Prueba";
        String message = payload != null && payload.get("message") != null ? payload.get("message").toString() : "Notificación simulada para verificación del Sprint 4.";
        String type = payload != null && payload.get("type") != null ? payload.get("type").toString() : "INFO";
        notificationAdapter.addNotification(title, message, type);
        return ResponseEntity.ok(Map.of("message", "Notificación simulada creada exitosamente"));
    }
}
