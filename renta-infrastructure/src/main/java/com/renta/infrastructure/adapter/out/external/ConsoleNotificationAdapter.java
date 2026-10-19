package com.renta.infrastructure.adapter.out.external;

import com.renta.domain.model.entity.Payment;
import com.renta.domain.model.entity.Reservation;
import com.renta.domain.port.out.NotificationServicePort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Adaptador de notificaciones empresariales (HU-11).
 * Registra eventos en consola y almacena alertas In-App en memoria para la interfaz web.
 */
@Component
public class ConsoleNotificationAdapter implements NotificationServicePort {

    private static final Logger log = LoggerFactory.getLogger(ConsoleNotificationAdapter.class);
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public record InAppNotification(
            String id,
            String title,
            String message,
            String type, // SUCCESS, INFO, WARNING, DANGER
            String timestamp,
            boolean read
    ) {
        public InAppNotification withRead(boolean read) {
            return new InAppNotification(id, title, message, type, timestamp, read);
        }
    }

    private final List<InAppNotification> notifications = new CopyOnWriteArrayList<>();

    public ConsoleNotificationAdapter() {
        // Notificaciones iniciales de bienvenida y estado del sistema
        notifications.add(new InAppNotification(
                UUID.randomUUID().toString(),
                "¡Bienvenido a RentaMaq!",
                "Plataforma empresarial de alquiler de maquinaria para obra civil con respaldo DIAN.",
                "INFO",
                LocalDateTime.now().minusHours(2).format(FORMATTER),
                false
        ));
        notifications.add(new InAppNotification(
                UUID.randomUUID().toString(),
                "Sistema Operativo",
                "Monitoreo perimetral y métricas en vivo con Spring Boot Actuator.",
                "SUCCESS",
                LocalDateTime.now().minusHours(1).format(FORMATTER),
                false
        ));
    }

    public List<InAppNotification> getNotifications() {
        return Collections.unmodifiableList(new ArrayList<>(notifications));
    }

    public void markAsRead(String id) {
        for (int i = 0; i < notifications.size(); i++) {
            InAppNotification notif = notifications.get(i);
            if (notif.id().equals(id)) {
                notifications.set(i, notif.withRead(true));
                break;
            }
        }
    }

    public void markAllAsRead() {
        for (int i = 0; i < notifications.size(); i++) {
            notifications.set(i, notifications.get(i).withRead(true));
        }
    }

    public void addNotification(String title, String message, String type) {
        InAppNotification notif = new InAppNotification(
                UUID.randomUUID().toString(),
                title,
                message,
                type,
                LocalDateTime.now().format(FORMATTER),
                false
        );
        notifications.add(0, notif); // Insertar al inicio (más reciente primero)
        if (notifications.size() > 50) {
            notifications.remove(notifications.size() - 1);
        }
    }

    @Override
    public void notifyReservationApproved(Reservation reservation) {
        log.info("[NOTIFICACION] Reserva aprobada exitosamente: Código {} para Cliente ID {}",
                reservation.getReservationCode(), reservation.getClientId());
        addNotification(
                "Reserva Aprobada",
                String.format("La reserva %s fue aprobada y está lista para despacho a pie de obra.", reservation.getReservationCode()),
                "SUCCESS"
        );
    }

    @Override
    public void notifyReservationCancelled(Reservation reservation, String reason) {
        log.info("[NOTIFICACION] Reserva cancelada: Código {} - Motivo: {}",
                reservation.getReservationCode(), reason);
        addNotification(
                "Reserva Cancelada",
                String.format("La reserva %s fue cancelada. Motivo: %s", reservation.getReservationCode(), reason),
                "WARNING"
        );
    }

    @Override
    public void notifyPaymentReceived(Payment payment) {
        log.info("[NOTIFICACION] Pago confirmado: Ref {} por monto {}",
                payment.getTransactionReference(), payment.getAmount() != null ? payment.getAmount().amount() : "N/A");
        addNotification(
                "Pago Confirmado",
                String.format("Transacción %s confirmada por un valor de $ %s COP. Factura electrónica emitida.",
                        payment.getTransactionReference(), payment.getAmount() != null ? payment.getAmount().amount() : "0.00"),
                "SUCCESS"
        );
    }
}
