# Guía de Integración y Examen: Bloqueo y Suspensión de Cuentas por Administrador

## 📌 Enunciado Típico de Examen
> *"Permita que el Administrador bloquee temporal o definitivamente la cuenta de un usuario por morosidad o daños reiterados. Al bloquear la cuenta, el usuario no debe poder autenticarse en la plataforma (Spring Security debe rechazar sus credenciales de inmediato con cuenta bloqueada). El Administrador debe poder desbloquear al usuario cuando regularice su situación."*

---

## 🏛️ Componentes y Arquitectura Hexagonal

### 1. Base de Datos (PostgreSQL)
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lock_reason VARCHAR(255);
```

### 2. Dominio (`renta-domain`)
* **Entidad:** `User.java`
  - Atributos `boolean locked` y `String lockReason`.
  - Métodos de negocio: `user.lock(String reason)` y `user.unlock()`.

### 3. Seguridad e Infraestructura (`renta-infrastructure`)
* **Entidad JPA:** `UserJpaEntity.java` con columnas `is_locked` y `lock_reason`.
* **Mapeo:** `UserJpaMapper.java`.
* **Integración Spring Security:** `CustomUserDetails.java`
  - `isAccountNonLocked()` retorna `!user.isLocked()`.
  - `isEnabled()` retorna `user.isActive() && !user.isLocked()`.
  - Cuando un usuario bloqueado intenta hacer login en `POST /api/v1/auth/login`, Spring Security (`DaoAuthenticationProvider`) lanza `LockedException`, denegando el token JWT.
* **Controlador REST:** `AdminController.java`
  - `PATCH /api/v1/admin/users/{id}/lock` (acepta `@RequestBody LockUserRequest`)
  - `PATCH /api/v1/admin/users/{id}/unlock`

---

## 🚀 Cómo Defenderlo en el Examen
1. **Alineación con el estándar de Spring Security:** No se crearon filtros ad-hoc ni verificaciones manuales en cada endpoint; se implementó el contrato nativo `UserDetails.isAccountNonLocked()`.
2. **Auditoría del motivo:** Permite documentar por qué se suspendió la cuenta (ej. "Mora superior a 30 días en fianza").
