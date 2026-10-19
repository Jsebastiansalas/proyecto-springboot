package com.renta.infrastructure.config.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * ============================================================================
 * REGISTRO DE AUDITORÍA DE SEGURIDAD (SECURITY AUDIT LOGGER)
 * ============================================================================
 * 
 * Registra eventos de seguridad críticos para cumplimiento normativo (OWASP A09:
 * Security Logging and Monitoring Failures) y trazabilidad forense:
 * - Inicios de sesión exitosos y fallidos.
 * - Cambios de contraseña.
 * - Activación/suspensión de cuentas y verificación de proveedores.
 * - Intentos de acceso denegados (BOLA / IDOR).
 */
@Component
public class SecurityAuditLogger {

    private static final Logger auditLog = LoggerFactory.getLogger("SECURITY_AUDIT");

    public void logEvent(String eventType, String subject, String ip, boolean success, String details) {
        String status = success ? "SUCCESS" : "FAILURE";
        auditLog.info("[AUDIT] timestamp=\"{}\" event=\"{}\" subject=\"{}\" ip=\"{}\" status=\"{}\" details=\"{}\"",
                Instant.now(),
                eventType,
                subject != null ? subject : "ANONYMOUS",
                ip != null ? ip : "UNKNOWN",
                status,
                details != null ? details.replace("\"", "'") : ""
        );
    }
}
