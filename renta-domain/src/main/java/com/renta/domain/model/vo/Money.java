package com.renta.domain.model.vo;

import com.renta.domain.exception.BusinessRuleViolationException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

/**
 * Immutable Value Object representing monetary values with fixed 2-decimal scale.
 * Default currency is Colombian Peso (COP).
 */
public record Money(BigDecimal amount, String currency) implements Comparable<Money> {

    public static final String DEFAULT_CURRENCY = "COP";
    public static final RoundingMode DEFAULT_ROUNDING = RoundingMode.HALF_UP;

    public Money {
        Objects.requireNonNull(amount, "El importe monetario no puede ser nulo");
        if (currency == null || currency.trim().isEmpty()) {
            currency = DEFAULT_CURRENCY;
        }
        amount = amount.setScale(2, DEFAULT_ROUNDING);
    }

    public static Money cop(BigDecimal amount) {
        return new Money(amount, DEFAULT_CURRENCY);
    }

    public static Money cop(long amount) {
        return new Money(BigDecimal.valueOf(amount), DEFAULT_CURRENCY);
    }

    public static Money cop(double amount) {
        return new Money(BigDecimal.valueOf(amount), DEFAULT_CURRENCY);
    }

    public static Money of(BigDecimal amount) {
        return cop(amount);
    }

    public static Money of(long amount) {
        return cop(amount);
    }

    public static Money of(BigDecimal amount, String currency) {
        return new Money(amount, currency);
    }

    public static Money zero() {
        return cop(BigDecimal.ZERO);
    }

    public static Money zero(String currency) {
        return new Money(BigDecimal.ZERO, currency);
    }

    public Money plus(Money other) {
        validateSameCurrency(other);
        return new Money(this.amount.add(other.amount), this.currency);
    }

    public Money add(Money other) {
        return plus(other);
    }

    public Money minus(Money other) {
        validateSameCurrency(other);
        return new Money(this.amount.subtract(other.amount), this.currency);
    }

    public Money subtract(Money other) {
        return minus(other);
    }

    public Money multiply(long factor) {
        return multiply(BigDecimal.valueOf(factor));
    }

    public Money multiply(double factor) {
        return multiply(BigDecimal.valueOf(factor));
    }

    public Money multiply(BigDecimal factor) {
        Objects.requireNonNull(factor, "El factor de multiplicación no puede ser nulo");
        return new Money(this.amount.multiply(factor).setScale(2, DEFAULT_ROUNDING), this.currency);
    }

    public Money percentage(BigDecimal percent) {
        Objects.requireNonNull(percent, "El porcentaje no puede ser nulo");
        BigDecimal calculated = this.amount.multiply(percent)
                .divide(BigDecimal.valueOf(100), 2, DEFAULT_ROUNDING);
        return new Money(calculated, this.currency);
    }

    public boolean isGreaterThan(Money other) {
        return compareTo(other) > 0;
    }

    public boolean isLessThan(Money other) {
        return compareTo(other) < 0;
    }

    public boolean isGreaterThanOrEqualTo(Money other) {
        return compareTo(other) >= 0;
    }

    public boolean isLessThanOrEqualTo(Money other) {
        return compareTo(other) <= 0;
    }

    public boolean isZero() {
        return this.amount.compareTo(BigDecimal.ZERO.setScale(2, DEFAULT_ROUNDING)) == 0;
    }

    public boolean isPositive() {
        return this.amount.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean isNegative() {
        return this.amount.compareTo(BigDecimal.ZERO) < 0;
    }

    private void validateSameCurrency(Money other) {
        Objects.requireNonNull(other, "El importe a operar no puede ser nulo");
        if (!this.currency.equalsIgnoreCase(other.currency)) {
            throw new BusinessRuleViolationException(
                    String.format("No se pueden operar monedas distintas: %s vs %s", this.currency, other.currency)
            );
        }
    }

    @Override
    public int compareTo(Money other) {
        validateSameCurrency(other);
        return this.amount.compareTo(other.amount);
    }

    @Override
    public String toString() {
        return String.format("%s %s", currency, amount);
    }
}
