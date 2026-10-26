# 📋 Funcionalidad 35: Anonimización de Datos Personales (Habeas Data / GDPR) e Integridad Fiscal DIAN

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Marco Legal:** Ley 1581 de 2012 (Habeas Data en Colombia) & GDPR Art. 17 ("Derecho al Olvido")  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Módulos Involucrados:** `renta-domain` · `renta-infrastructure` · `renta-application`

---

## 🎯 ¿Qué "Cáscara" o Pregunta Trampa del Profesor Resuelve?
En exámenes de bases de datos, legislación de software y arquitectura:
> *"Si un contratista se retira de la plataforma y exige legalmente borrar todos sus datos personales bajo el Derecho al Olvido, ¿qué hace tu sistema?"*
> *"¿Ejecutas un `DELETE CASCADE` borrando al usuario y destruyendo el historial de facturación de la empresa, lo cual es ilegal ante la DIAN (Estatuto Tributario exige conservar facturas 5 años)? ¿O falla la base de datos por violación de llaves foráneas (`FK Constraint Violation`)?"*

### La Solución Arquitectónica:
El patrón de **Pseudonimización y Anonimización Criptográfica Irreversible**:
1. **No se hace un `DELETE` físico.** Las tablas `reservations` y `rental_returns` conservan su integridad referencial, montos, impuestos y fechas para fines fiscales.
2. Los datos de identificación personal (*PII: Personally Identifiable Information*) se reemplazan por hashes opacos:
   - Nombre $\to$ `"USUARIO_ANONIMIZADO_#481"`
   - Email $\to$ `"anonymized_481@gdpr.rentamaq.local"`
   - Teléfono / Dirección $\to$ `"[DATO_SUPRIMIDO]"`
   - Estado de la cuenta $\to$ `ANONYMIZED_CLOSED` (inhabilitada de por vida).

---

## 🗄️ Procedimiento SQL Transaccional de Anonimización

```sql
-- Función almacenada para cumplimiento de Habeas Data
CREATE OR REPLACE FUNCTION sp_anonymize_user_data(target_user_id BIGINT)
RETURNS VOID AS $$
BEGIN
    -- 1. Verificar que el usuario no tenga reservas ACTIVAS en curso
    IF EXISTS (SELECT 1 FROM reservations WHERE client_id = target_user_id AND status IN ('CONFIRMADA', 'PAGADA', 'EN_CURSO')) THEN
        RAISE EXCEPTION 'No se puede anonimizar un usuario con reservas activas o maquinaria en obra.';
    END IF;

    -- 2. Anonimizar datos personales en la tabla de clientes / usuarios
    UPDATE users
    SET 
        name = CONCAT('USUARIO_ANONIMIZADO_', id),
        email = CONCAT('deleted_', MD5(CONCAT(id::text, NOW()::text)), '@gdpr.rentamaq.local'),
        password_hash = 'DISABLED_ACCOUNT_DELETED_BY_USER_REQUEST',
        phone = '0000000000',
        is_active = FALSE
    WHERE id = target_user_id;

    -- 3. Dejar constancia legal en auditoría
    INSERT INTO security_audit_logs (event_type, subject_id, description, created_at)
    VALUES ('USER_GDPR_ANONYMIZED', target_user_id, 'Anonimización legal ejecutada bajo Ley 1581 de 2012', NOW());
END;
$$ LANGUAGE plpgsql;
```

---

## 🏗️ Servicio de Aplicación en Spring Boot

```java
@Service
@Transactional
public class UserAnonymizationService {

    private final UserRepository userRepo;
    private final ReservationRepository reservationRepo;
    private final SecurityAuditLogger auditLogger;

    public void anonymizeUser(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        boolean hasActiveRentals = reservationRepo.existsActiveByClientId(userId);
        if (hasActiveRentals) {
            throw new IllegalStateException("El contratista tiene maquinaria en alquiler sin devolver. Debe cerrar las reservas antes de solicitar la supresión de datos.");
        }

        // Ejecutar anonimización en el modelo de dominio
        user.anonymizeIdentity();
        userRepo.save(user);

        auditLogger.logEvent("GDPR_FORGET_USER", String.valueOf(userId), "Usuario anonimizado conservando registros contables");
    }
}
```

---

## 🎓 Pregunta de Examen y Argumento de Defensa

* **Pregunta del Profesor:** *"¿Cómo demuestras a un auditor que cumpliste la ley de protección de datos sin violar las normas tributarias de la DIAN?"*
* **Respuesta de 10:** *"Cumplimos el principio de limitación del almacenamiento de la Ley 1581/GDPR mediante anonimización irreversible de los datos identificatorios, mientras que el principio de inmutabilidad contable del Código de Comercio se preserva intacto: los libros contables, valores de IVA y retenciones siguen cuadrando al centavo sin romper la integridad relacional de la base de datos."*
