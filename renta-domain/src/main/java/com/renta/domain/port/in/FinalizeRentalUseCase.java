package com.renta.domain.port.in;

import com.renta.domain.model.entity.RentalReturn;

/**
 * Inbound port alias for {@link FinishRentalUseCase}.
 */
public interface FinalizeRentalUseCase extends FinishRentalUseCase {

    default RentalReturn finalizeRental(FinishRentalCommand command) {
        return finishRental(command);
    }
}
