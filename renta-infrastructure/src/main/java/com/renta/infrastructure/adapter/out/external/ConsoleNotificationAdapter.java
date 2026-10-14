package com.renta.infrastructure.adapter.out.external;

import com.renta.domain.model.entity.Payment;
import com.renta.domain.model.entity.Reservation;
import com.renta.domain.port.out.NotificationServicePort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class ConsoleNotificationAdapter implements NotificationServicePort {

    private static final Logger log = LoggerFactory.getLogger(ConsoleNotificationAdapter.class);

    @Override
    public void notifyReservationApproved(Reservation reservation) {
        log.info("[NOTIFICACION] Reserva aprobada exitosamente: Código {} para Cliente ID {}",
                reservation.getReservationCode(), reservation.getClientId());
    }

    @Override
    public void notifyReservationCancelled(Reservation reservation, String reason) {
        log.info("[NOTIFICACION] Reserva cancelada: Código {} - Motivo: {}",
                reservation.getReservationCode(), reason);
    }

    @Override
    public void notifyPaymentReceived(Payment payment) {
        log.info("[NOTIFICACION] Pago confirmado: Ref {} por monto {}",
                payment.getTransactionReference(), payment.getAmount() != null ? payment.getAmount().amount() : "N/A");
    }
}
