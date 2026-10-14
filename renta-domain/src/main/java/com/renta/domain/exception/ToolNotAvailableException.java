package com.renta.domain.exception;

/**
 * Thrown when an operation cannot proceed because the requested tool is not available
 * (e.g. in maintenance, already rented, or retired).
 */
public class ToolNotAvailableException extends DomainException {

    public ToolNotAvailableException(String message) {
        super(message);
    }

    public ToolNotAvailableException(Long toolId, String reason) {
        super(String.format("La herramienta con ID %d no está disponible: %s", toolId, reason));
    }
}
