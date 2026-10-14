package com.renta.domain.port.in;

import com.renta.domain.model.vo.DateRange;
import com.renta.domain.model.vo.RentalPriceCalculation;

import java.math.BigDecimal;

/**
 * Inbound port for calculating rental prices and tax breakdowns.
 */
public interface CalculateRentalPriceUseCase {

    RentalPriceCalculation calculatePrice(Long toolId, DateRange dateRange);

    RentalPriceCalculation calculatePrice(BigDecimal baseDailyPrice, int totalDays);
}
