# 📋 Funcionalidad 38: Control de Concurrencia Optimista con `@Version` y Prevención del "Lost Update"

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Patrón de Diseño:** Optimistic Concurrency Control (OCC) con Detección de Conflicto (HTTP 409 Conflict)  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Módulos Involucrados:** `renta-infrastructure` (JPA Entity & Global Exception Handler) · `renta-domain`

---

## 🎯 ¿Qué "Cáscara" o Pregunta Trampa del Profesor Resuelve?
En exámenes de bases de datos, JPA y concurrencia empresarial:
> *"Dos administradores abren al mismo tiempo la ficha técnica de la 'Retroexcavadora Caterpillar'. El Administrador 1 modifica el precio a $450.000 COP y guarda. Un segundo después, el Administrador 2, que aún tenía la pantalla vieja abierta, cambia el estado a 'EN REVISIÓN' y guarda con el precio viejo."*
> *"¿Tu sistema sufre del clásico problema de la 'Actualización Perdida' (Lost Update Problem)? ¿Cómo lo detecta y previene JPA/Hibernate sin bloquear las lecturas?"*

### La Solución Arquitectónica:
El patrón de **Bloqueo Optimista** mediante la anotación `@Version` de JPA:
1. Cada entidad sensible (`tools`, `reservations`) posee una columna numérica entera `version`.
2. Al ejecutar un `UPDATE`, Hibernate agrega automáticamente la cláusula:
   ```sql
   UPDATE tools SET name = ?, price = ?, version = version + 1 
   WHERE id = ? AND version = ?;
   ```
3. Si el segundo usuario intenta guardar con una versión desactualizada, el motor detecta que cero filas fueron afectadas y lanza `OptimisticLockException` (`ObjectOptimisticLockingFailureException`).
4. El `GlobalExceptionHandler` captura la excepción y retorna un limpio código **`HTTP 409 Conflict`** informando que los datos fueron modificados concurrentemente por otro usuario.

---

## 🏗️ Implementación Técnica en JPA y Spring Boot

### 1. Entidad con `@Version` (`ToolJpaEntity.java`)

```java
package com.rentamaq.infrastructure.persistence.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tools")
public class ToolJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "base_daily_price", nullable = false)
    private Double baseDailyPrice;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    // Getters y Setters
    public Long getVersion() {
        return version;
    }
}
```

### 2. Manejo Global del Conflicto (`GlobalExceptionHandler.java`)

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<Map<String, Object>> handleOptimisticLock(ObjectOptimisticLockingFailureException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
            "status", 409,
            "error", "CONFLICT_VERSION_MISMATCH",
            "message", "El registro fue modificado simultáneamente por otro usuario o proceso. Por favor refresca la pantalla para obtener los datos más recientes.",
            "timestamp", Instant.now().toString()
        ));
    }
}
```

### 3. Captura en el Frontend React

```typescript
try {
  await rentaService.tools.update(toolId, updatedData);
  showToast('Herramienta actualizada con éxito.', 'success');
} catch (err: any) {
  if (err.status === 409) {
    showToast('⚠️ Conflicto de Concurrencia: Otro usuario modificó este equipo. La página se actualizará automáticamente.', 'error');
    refetchToolData();
  }
}
```

---

## 🎓 Pregunta de Examen y Argumento de Defensa

* **Pregunta del Profesor:** *"¿Por qué preferir Bloqueo Optimista (`@Version`) sobre Bloqueo Pesimista (`PESSIMISTIC_WRITE`) para la edición de herramientas?"*
* **Respuesta de 10:** *"El Bloqueo Pesimista retiene locks en PostgreSQL mientras el usuario tiene el formulario abierto en su navegador, agotando el pool de conexiones de la base de datos si el usuario deja la pestaña inactiva. El Bloqueo Optimista no bloquea lecturas y solo valida al momento exacto del `commit`, ofreciendo máximo rendimiento y escalabilidad horizontal."*
