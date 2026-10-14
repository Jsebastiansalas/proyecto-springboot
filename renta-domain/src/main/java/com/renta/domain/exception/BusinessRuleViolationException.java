package com.renta.domain.exception;

/**
 * Thrown when an operation violates a domain invariant, illegal state transition, or business rule.
 */
public class BusinessRuleViolationException extends DomainException {

    public BusinessRuleViolationException(String message) {
        super(message);
    }

    public BusinessRuleViolationException(String message, Throwable cause) {
        super(message, cause);
    }
}
