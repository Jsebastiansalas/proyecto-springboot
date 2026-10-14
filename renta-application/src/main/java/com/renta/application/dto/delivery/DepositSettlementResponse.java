package com.renta.application.dto.delivery;

import com.renta.domain.model.enums.SettlementStatus;
import com.renta.domain.model.enums.ToolConditionStatus;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * DTO representing the transparent financial liquidation receipt of a rental security deposit.
 */
public record DepositSettlementResponse(
        Long reservationId,
        String reservationCode,
        String clientName,
        String toolName,
        BigDecimal initialDeposit,
        BigDecimal damageDeduction,
        BigDecimal refundAmount,
        BigDecimal extraChargeDue,
        SettlementStatus settlementStatus,
        ToolConditionStatus toolConditionStatus,
        String inspectionNotes,
        Instant returnDate
) {}
