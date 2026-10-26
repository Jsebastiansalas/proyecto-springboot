package com.renta.infrastructure.adapter.in.rest;

import com.renta.application.dto.notification.UserNotificationResponse;
import com.renta.infrastructure.adapter.out.persistence.entity.ClientJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.entity.ReservationJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.entity.UserNotificationJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataClientRepository;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataReservationRepository;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataUserNotificationRepository;
import com.renta.infrastructure.adapter.out.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "12. Notificaciones y Tareas Programadas", description = "Centro de alertas automáticas, scheduler de vencimiento de alquileres y notificaciones in-app")
public class NotificationController {

    private final SpringDataUserNotificationRepository notificationRepository;
    private final SpringDataReservationRepository reservationRepository;
    private final SpringDataClientRepository clientRepository;

    public NotificationController(
            SpringDataUserNotificationRepository notificationRepository,
            SpringDataReservationRepository reservationRepository,
            SpringDataClientRepository clientRepository) {
        this.notificationRepository = notificationRepository;
        this.reservationRepository = reservationRepository;
        this.clientRepository = clientRepository;
    }

    @GetMapping("/my")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Obtener notificaciones del usuario", description = "Lista las notificaciones más recientes del usuario autenticado ordenadas por fecha.")
    public ResponseEntity<List<UserNotificationResponse>> getMyNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        List<UserNotificationJpaEntity> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<UserNotificationResponse> responses = list.stream().map(this::mapToResponse).toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/my/unread-count")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Conteo de notificaciones no leídas", description = "Retorna el total de notificaciones pendientes para mostrar en el badge de la campana.")
    public ResponseEntity<Map<String, Object>> getUnreadCount(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        long count = notificationRepository.countByUserIdAndReadFalse(userId);
        return ResponseEntity.ok(Map.of(
                "userId", userId,
                "unreadCount", count
        ));
    }

    @PatchMapping("/{id}/read")
    @Transactional
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Marcar notificación como leída", description = "Actualiza el estado de una notificación a leída.")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return notificationRepository.findById(id)
                .map(n -> {
                    n.setRead(true);
                    notificationRepository.save(n);
                    return ResponseEntity.ok(Map.<String, Object>of("id", id, "read", true));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/my/read-all")
    @Transactional
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Marcar todas las notificaciones como leídas", description = "Limpia el contador de notificaciones no leídas del usuario.")
    public ResponseEntity<Map<String, Object>> markAllAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        int updated = notificationRepository.markAllAsReadForUser(userId);
        return ResponseEntity.ok(Map.of(
                "userId", userId,
                "markedAsReadCount", updated
        ));
    }

    /**
     * Tarea programada diaria (8:00 AM) y ejecutable bajo demanda mediante REST.
     * Escanea reservas activas que vencen en las próximas 48 horas y despacha alertas.
     */
    @Scheduled(cron = "0 0 8 * * *")
    @PostMapping("/trigger-expiration-alerts")
    @Transactional
    @Operation(summary = "Ejecutar escaneo de alertas de vencimiento (Scheduler)", 
               description = "Dispara el proceso de fondo que detecta reservas próximas a vencer y genera notificaciones in-app automáticas.")
    public ResponseEntity<Map<String, Object>> triggerExpirationAlerts() {
        LocalDate today = LocalDate.now(ZoneId.of("America/Bogota"));
        LocalDate windowEnd = today.plusDays(3);

        List<ReservationJpaEntity> activeReservations = reservationRepository.findAll().stream()
                .filter(r -> "APROBADA".equalsIgnoreCase(r.getStatus()) || "EN_CURSO".equalsIgnoreCase(r.getStatus()))
                .filter(r -> !r.getEndDate().isBefore(today) && !r.getEndDate().isAfter(windowEnd))
                .toList();

        int alertsCreated = 0;

        for (ReservationJpaEntity res : activeReservations) {
            Long clientId = res.getClientId();
            // Resolver user_id a partir del clientId
            Long targetUserId = clientRepository.findById(clientId)
                    .map(ClientJpaEntity::getUserId)
                    .orElse(clientId);

            String title = "⚠️ Alerta de Vencimiento: " + res.getReservationCode();
            String type = "ALERTA_VENCIMIENTO";

            // Evitar notificaciones duplicadas para el mismo contrato
            if (!notificationRepository.existsByUserIdAndTitleAndType(targetUserId, title, type)) {
                String msg = String.format("Tu alquiler %s finaliza el %s. Recuerda solicitar una prórroga con antelación o coordinar el retorno técnico.",
                        res.getReservationCode(), res.getEndDate());

                UserNotificationJpaEntity notification = new UserNotificationJpaEntity(
                        targetUserId,
                        title,
                        msg,
                        type,
                        "/client-portal"
                );
                notificationRepository.save(notification);
                alertsCreated++;
            }
        }

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "executionDate", today.toString(),
                "scannedReservations", activeReservations.size(),
                "alertsCreated", alertsCreated,
                "message", "Escaneo de vencimientos completado satisfactoriamente por el scheduler de fondo."
        ));
    }

    private Long resolveUserId(CustomUserDetails userDetails) {
        if (userDetails != null && userDetails.getId() != null) {
            return userDetails.getId();
        }
        return 1L; // Fallback al usuario demo principal (Carlos Gómez)
    }

    private UserNotificationResponse mapToResponse(UserNotificationJpaEntity entity) {
        return new UserNotificationResponse(
                entity.getId(),
                entity.getUserId(),
                entity.getTitle(),
                entity.getMessage(),
                entity.getType(),
                entity.isRead(),
                entity.getLinkUrl(),
                entity.getCreatedAt()
        );
    }
}
