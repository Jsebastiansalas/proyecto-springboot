package com.renta.application.port.out;

/**
 * Puerto de salida para codificación y verificación de contraseñas (BCrypt).
 */
public interface PasswordEncoderPort {

    String encode(CharSequence rawPassword);

    boolean matches(CharSequence rawPassword, String encodedPassword);
}
