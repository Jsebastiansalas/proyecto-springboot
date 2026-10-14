package com.renta.domain.port.in;

import com.renta.domain.model.entity.RentalDelivery;

import java.time.LocalDateTime;

/**
 * Inbound port for starting the rental period through equipment handover.
 */
public interface StartRentalUseCase {

    RentalDelivery startRental(StartRentalCommand command);

    record StartRentalCommand(
            Long reservationId,
            String deliveredBy,
            String initialConditionNotes,
            boolean clientSignatureAck
    ) {}
}
