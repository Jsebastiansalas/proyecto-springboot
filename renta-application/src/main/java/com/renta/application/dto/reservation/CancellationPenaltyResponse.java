package com.renta.application.dto.reservation;

import java.math.BigDecimal;

public record CancellationPenaltyResponse(
        Long reservationId,
        String reservationCode,
        String previousStatus,
        String currentStatus,
        BigDecimal originalTotalAmount,
        BigDecimal penaltyPercentage,
        BigDecimal penaltyFeeAmount,
        BigDecimal refundedDepositAmount,
        BigDecimal totalRefundedToClient,
        String policyExplanation,
        String cancellationReason
) {
}
