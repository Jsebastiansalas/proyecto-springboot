package com.renta.domain.exception;

/**
 * Thrown when a date range is semantically invalid (e.g. end date is before start date).
 */
public class InvalidDateRangeException extends DomainException {

    public InvalidDateRangeException(String message) {
        super(message);
    }
}
