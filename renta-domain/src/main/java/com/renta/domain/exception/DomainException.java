package com.renta.domain.exception;

/**
 * Base unchecked exception for all domain-specific errors.
 * Ensures the domain module remains pure and decoupled from framework exception hierarchies.
 */
public abstract class DomainException extends RuntimeException {

    protected DomainException(String message) {
        super(message);
    }

    protected DomainException(String message, Throwable cause) {
        super(message, cause);
    }
}
