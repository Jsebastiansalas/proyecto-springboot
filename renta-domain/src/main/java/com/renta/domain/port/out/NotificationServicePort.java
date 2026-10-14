package com.renta.domain.port.out;

import com.renta.domain.model.entity.Payment;
import com.renta.domain.model.entity.Reservation;

/**
 * Outbound SPI port for email and notification delivery services.
 */
public interface NotificationServicePort {

    void notifyReservationApproved(Reservation reservation);

    void notifyReservationCancelled(Reservation reservation, String reason);

    void notifyPaymentReceived(Payment payment);
}
