package com.renta.domain.exception;

/**
 * Excepción lanzada cuando las credenciales de autenticación son incorrectas o no coinciden.
 * Mapea a HTTP 401 Unauthorized en el adaptador REST.
 */
public class InvalidCredentialsException extends DomainException {

    public InvalidCredentialsException() {
        super("Credenciales inválidas: email o contraseña incorrectos");
    }

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
