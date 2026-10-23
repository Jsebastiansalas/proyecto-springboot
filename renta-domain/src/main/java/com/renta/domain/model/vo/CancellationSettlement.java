package com.renta.domain.model.vo;

import java.math.BigDecimal;

public record CancellationSettlement(
        Long reservationId,
        Money originalTotalAmount,
        Money originalRentalSubtotal,
        Money refundedDepositAmount,
        BigDecimal penaltyPercentage,
        Money penaltyFeeAmount,
        Money totalRefundedToClient,
        String policyExplanation
) {
}
