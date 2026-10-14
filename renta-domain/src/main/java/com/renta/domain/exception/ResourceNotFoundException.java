package com.renta.domain.exception;

/**
 * Thrown when a requested domain entity or aggregate root cannot be found.
 */
public class ResourceNotFoundException extends DomainException {

    public ResourceNotFoundException(String resourceName, Object identifier) {
        super(String.format("El recurso '%s' con identificador '%s' no fue encontrado.", resourceName, identifier));
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
