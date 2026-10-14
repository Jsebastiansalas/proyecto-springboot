package com.renta.domain.model.vo;

import com.renta.domain.exception.BusinessRuleViolationException;
import com.renta.domain.model.enums.SettlementStatus;

import java.util.Objects;

/**
 * Value Object encapsulating the mathematical liquidation formula of equipment security deposits.
 *
 * Formula:
 * Refund = max(0, Initial Deposit - Repair Cost)
 * Extra Charge Due = max(0, Repair Cost - Initial Deposit)
 */
public record DepositSettlement(
        Money initialDeposit,
        Money damageDeduction,
        Money refundAmount,
        Money extraChargeDue,
        SettlementStatus status
) {
    public DepositSettlement {
        Objects.requireNonNull(initialDeposit, "initialDeposit must not be null");
        Objects.requireNonNull(damageDeduction, "damageDeduction must not be null");
        Objects.requireNonNull(refundAmount, "refundAmount must not be null");
        Objects.requireNonNull(extraChargeDue, "extraChargeDue must not be null");
        Objects.requireNonNull(status, "status must not be null");
    }

    /**
     * Calculates the smart deposit settlement based on initial deposit and estimated repair costs.
     *
     * @param initialDeposit the security deposit originally paid
     * @param damageCost the assessed or estimated repair cost (zero if no damage)
     * @return the calculated {@link DepositSettlement}
     */
    public static DepositSettlement calculate(Money initialDeposit, Money damageCost) {
        Money deposit = initialDeposit != null ? initialDeposit : Money.zero();
        Money damage = damageCost != null ? damageCost : Money.zero();

        if (deposit.amount().signum() < 0) {
            throw new BusinessRuleViolationException("El depósito en garantía no puede ser negativo");
        }
        if (damage.amount().signum() < 0) {
            throw new BusinessRuleViolationException("El costo de reparación o daño no puede ser negativo");
        }

        Money refund;
        Money extraCharge;
        SettlementStatus status;

        if (damage.equals(Money.zero())) {
            refund = deposit;
            extraCharge = Money.zero();
            status = SettlementStatus.REEMBOLSO_TOTAL;
        } else if (damage.isLessThan(deposit)) {
            refund = deposit.subtract(damage);
            extraCharge = Money.zero();
            status = SettlementStatus.REEMBOLSO_PARCIAL;
        } else if (damage.equals(deposit)) {
            refund = Money.zero();
            extraCharge = Money.zero();
            status = SettlementStatus.RETENIDO_TOTAL;
        } else {
            refund = Money.zero();
            extraCharge = damage.subtract(deposit);
            status = SettlementStatus.SALDO_PENDIENTE_COBRO;
        }

        return new DepositSettlement(deposit, damage, refund, extraCharge, status);
    }
}
