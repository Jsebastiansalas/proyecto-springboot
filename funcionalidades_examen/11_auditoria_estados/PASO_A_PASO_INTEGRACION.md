# Guía de Integración y Examen: Pista de Auditoría de Cambios de Estado (Audit Trail)

## 📌 Enunciado Típico de Examen
> *"Cada vez que una reserva cambie de estado (de PENDIENTE a APROBADA, RECHAZADA, CANCELADA o EXTENDIDA), el sistema debe almacenar un registro inmutable en una tabla de auditoría con: ID de reserva, estado previo, estado nuevo, usuario que ejecutó la acción, fecha/hora exacta y motivo del cambio. Exponga un endpoint para consultar la cronología completa de la reserva."*

---

## 🏛️ Componentes y Arquitectura Hexagonal

### 1. Base de Datos (PostgreSQL)
```sql
CREATE TABLE IF NOT EXISTS reservation_status_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by VARCHAR(150),
    changed_at TIMESTAMP NOT NULL,
    reason TEXT
);
CREATE INDEX IF NOT EXISTS idx_res_audit_res_id ON reservation_status_audit_logs(reservation_id);
```

### 2. Dominio (`renta-domain`)
* **Entidad:** `ReservationStatusAuditLog.java` en `com.renta.domain.model.entity`.
* **Puerto de Salida:** `ReservationAuditLogRepositoryPort.java` en `com.renta.domain.port.out`.

### 3. Aplicación (`renta-application`)
* **DTO:** `ReservationAuditLogResponse.java` en `com.renta.application.dto.reservation`.
* **Servicio:** `ReservationApplicationService.java`
  - Método privado `recordAudit(...)` invocado en `createReservation`, `approveReservation`, `rejectReservation`, `cancelReservation` y `extendReservation`.
  - Método de consulta `getAuditTrail(Long reservationId)`.

### 4. Infraestructura (`renta-infrastructure`)
* **Entidad JPA:** `ReservationStatusAuditLogJpaEntity.java`.
* **Repositorio:** `SpringDataReservationAuditLogRepository.java`.
* **Adaptador de Persistencia:** `ReservationAuditLogRepositoryAdapter.java`.
* **Controlador REST:** `ReservationController.java`
  - Endpoint: `GET /api/v1/reservations/{id}/audit-trail`

---

## 🚀 Cómo Defenderlo en el Examen
1. **No repudio y Trazabilidad:** Cada cambio de estado deja constancia inmutable.
2. **Resiliencia:** El registro de auditoría captura excepciones para evitar que una falla secundaria aborte la operación principal de negocio.
3. **Seguridad y Control de Acceso:** Protegido con `@PreAuthorize("hasAnyRole('ADMIN', 'PROVEEDOR', 'CLIENTE') and @authz.canAccessReservation(principal, #id)")`.
