# 📋 Funcionalidad 30: Registro de Auditoría de Seguridad, Intentos Fallidos y Trazabilidad por IP

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Estándar Internacional:** OWASP Top 10 A09:2021 (Security Logging and Monitoring Failures) & ISO 27001  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Módulos Involucrados:** `renta-infrastructure` · `Spring Security` · `SLF4J Security Audit Logger`

---

## 🎯 ¿Qué problema de negocio resuelve?
En una plataforma transaccional de alquiler donde se manejan contratos millonarios, transferencias bancarias y datos sensibles de contratistas:
1. **Detección de Ataques de Fuerza Bruta:** Es indispensable identificar si una cuenta está siendo atacada mediante múltiples intentos de contraseña fallidos desde una misma dirección IP.
2. **Auditoría Forense y No-Repudio:** Si un administrador modifica un precio base o desbloquea a un cliente moroso, debe quedar un rastro indeleble de quién lo hizo, cuándo y desde qué terminal de red.
3. **Cumplimiento Regulatorio y Habeas Data:** Ley 1581 de 2012 de Colombia exige registrar el acceso y mutación de bases de datos de clientes y empresas.

---

## 🛡️ Estructura del Registro de Auditoría de Seguridad

Cada evento crítico emite un log estructurado con el canal especializado `SECURITY_AUDIT`:

```
[AUDIT] timestamp="2026-10-25T21:26:02.697Z" event="LOGIN_SUCCESS" subject="admin@renta.com" ip="190.144.12.85" status="SUCCESS" details="Inicio de sesión exitoso. Rol: ROLE_ADMIN"
[AUDIT] timestamp="2026-10-25T21:28:15.120Z" event="LOGIN_FAILED" subject="carlos@obra.com" ip="186.155.40.12" status="FAILED" details="Contraseña errónea (Intento 2/5)"
[AUDIT] timestamp="2026-10-25T21:30:45.890Z" event="USER_LOCKED" subject="admin@renta.com" ip="0:0:0:0:0:0:0:1" status="SUCCESS" details="Bloqueo preventivo de usuario ID 4 por mora prolongada"
```

---

## 🏗️ Ubicación de los Componentes en el Proyecto

### 1. Capa de Infraestructura (`renta-infrastructure`)
- **Filtro de Seguridad:** [LoginRateLimiterFilter.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/config/security/LoginRateLimiterFilter.java) (control de tasa de peticiones y mitigación de DoS/Fuerza Bruta).
- **Adaptador de Autenticación:** [AuthServiceImpl.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/adapter/in/rest/AuthController.java) con emisión de eventos estructurados `SECURITY_AUDIT`.
- **Configuración de Seguridad:** [SecurityConfig.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/config/security/SecurityConfig.java) con cabeceras OWASP estrictas (HSTS, CSP, X-Frame-Options).

---

## 🔌 Endpoints Auditados

| Operación | Método y Ruta | Evento de Seguridad Registrado |
| :--- | :--- | :--- |
| **Inicio de Sesión** | `POST /api/v1/auth/login` | `LOGIN_SUCCESS` / `LOGIN_FAILED` con IP y User-Agent |
| **Cambio de Clave** | `POST /api/v1/auth/change-password` | `PASSWORD_CHANGED` con confirmación de hash BCrypt |
| **Bloqueo de Usuario** | `PATCH /api/v1/admin/users/{id}/lock` | `USER_LOCKED` por administrador auditado |
| **Aprobación de Reserva** | `PATCH /api/v1/reservations/{id}/approve` | `RESERVATION_APPROVED` con firma del patio |

---

## 🖥️ Interfaz de Usuario (React 18)

1. **Panel de Auditoría Administrativa ([AdminPortal.tsx](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/frontend/src/components/admin/AdminPortal.tsx)):**
   - Muestra el historial cronológico de auditoría con badges por tipo de severidad.
   - Permite filtrar por usuario, fecha o dirección IP para investigaciones de seguridad.

---

## 💡 Defensa en el Examen (Argumentos Técnicos)
- **Ciberseguridad Proactiva:** "La arquitectura implementa defensas en profundidad: limitador de tasa de peticiones por IP (`RateLimiting`), cabeceras de blindaje OWASP contra clickjacking y XSS, y logs de auditoría forense inmutables."
- **Preparado para SIEM / CloudWatch:** "Los logs estructurados en formato clave-valor permiten una integración inmediata con herramientas corporativas de monitoreo como Splunk, Datadog o ElasticSearch (ELK)."
