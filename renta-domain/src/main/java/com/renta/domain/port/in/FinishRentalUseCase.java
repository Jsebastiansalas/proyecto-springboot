package com.renta.domain.port.in;

import com.renta.domain.model.entity.RentalReturn;
import com.renta.domain.model.enums.ToolConditionStatus;
import com.renta.domain.model.vo.Money;

/**
 * Inbound port for concluding the rental period through equipment return and inspection.
 */
public interface FinishRentalUseCase {

    RentalReturn finishRental(FinishRentalCommand command);

    record FinishRentalCommand(
            Long reservationId,
            String receivedBy,
            ToolConditionStatus conditionStatus,
            String inspectionNotes,
            boolean depositRefunded,
            Money extraDamageFee
    ) {}
}
