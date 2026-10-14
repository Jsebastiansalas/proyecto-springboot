package com.renta.domain.port.in;

import com.renta.domain.model.vo.DepositSettlement;

/**
 * Inbound port for querying security deposit settlements.
 */
public interface GetSettlementUseCase {
    DepositSettlement getSettlementByReservationId(Long reservationId);
}
