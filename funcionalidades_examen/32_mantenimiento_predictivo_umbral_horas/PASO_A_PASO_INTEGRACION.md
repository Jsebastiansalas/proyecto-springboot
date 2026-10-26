# 📋 Funcionalidad 32: Bloqueo Automático por Mantenimiento Predictivo (Umbral de Horas de Motor)

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Patrón de Diseño:** Predictive Maintenance & Domain Event Trigger Pattern  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Módulos Involucrados:** `renta-domain` · `renta-application` · `renta-infrastructure`

---

## 🎯 ¿Qué "Cáscara" o Pregunta Trampa del Profesor Resuelve?
En auditorías de sistemas industriales o de flotas de alquiler, los evaluadores cuestionan:
> *"¿Tu sistema espera de forma pasiva a que un contratista devuelva la máquina con el motor fundido o un pistón reventado para mandarla al taller?"*
> *"¿Dónde está la proactividad del software para prevenir accidentes catastróficos y garantizar la vida útil de los activos según manual de fabricante?"*

### La Solución Arquitectónica:
Cada maquinaria pesada tiene un campo `operating_hours_threshold` (ej. cada **250 horas** para cambio de aceite/filtros en motores diésel o cada **500 horas** para calibración de rodamientos).  
Cuando el horómetro acumulado supera el umbral:
1. El equipo cambia automáticamente a estado `BLOQUEO_MANTENIMIENTO_PREDICTIVO`.
2. El sistema rechaza cualquier nueva cotización o reserva futura.
3. Se genera de forma automática una orden de servicio preventivo dirigida al jefe de taller en el portal de proveedores.

---

## 🧮 Lógica de Invariante en el Dominio

$$\text{Horas Acumuladas Desde Último Servicio} = \text{Horómetro Actual} - \text{Horómetro Último Mantenimiento}$$
$$\text{Alerta Predictiva} = (\text{Horas Acumuladas} \ge \text{Umbral Máximo de Servicio})$$

```java
public void recordOperatingHours(int newMeterReading) {
    if (newMeterReading < this.currentOperatingHours) {
        throw new DomainException("El horómetro nuevo (" + newMeterReading + ") no puede ser menor al actual (" + this.currentOperatingHours + ")");
    }
    this.currentOperatingHours = newMeterReading;
    
    int hoursSinceService = this.currentOperatingHours - this.lastServiceOperatingHours;
    if (hoursSinceService >= this.serviceIntervalHours) {
        this.status = ToolStatus.MANTENIMIENTO;
        this.requiresUrgentMaintenance = true;
        // Dispara evento de dominio: ToolExceededMaintenanceThresholdEvent
        this.registerEvent(new ToolMaintenanceDueEvent(this.id, this.name, hoursSinceService));
    }
}
```

---

## 🏗️ Implementación en Base de Datos y Servicio de Aplicación

### 1. Migración SQL en PostgreSQL

```sql
ALTER TABLE tools 
ADD COLUMN IF NOT EXISTS current_operating_hours INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_service_hours INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_interval_hours INT DEFAULT 250,
ADD COLUMN IF NOT EXISTS requires_urgent_maintenance BOOLEAN DEFAULT FALSE;

-- Vista rápida de herramientas en riesgo de sobreuso
CREATE OR REPLACE VIEW v_tools_due_maintenance AS
SELECT 
    id, 
    name, 
    current_operating_hours, 
    last_service_hours, 
    (current_operating_hours - last_service_hours) AS hours_since_service,
    service_interval_hours
FROM tools
WHERE (current_operating_hours - last_service_hours) >= service_interval_hours;
```

### 2. Disparador Automático tras Inspección de Retorno

```java
@Service
@Transactional
public class ReturnInspectionService {

    private final ToolRepository toolRepo;
    private final MaintenanceOrderRepository maintenanceRepo;

    public void processReturnInspection(Long toolId, int finalMeterReading) {
        Tool tool = toolRepo.findById(toolId)
                .orElseThrow(() -> new EntityNotFoundException("Herramienta no encontrada"));

        // Actualiza horómetro y evalúa invariante de mantenimiento preventivo
        tool.recordOperatingHours(finalMeterReading);
        toolRepo.save(tool);

        if (tool.isRequiresUrgentMaintenance()) {
            maintenanceRepo.createAutomatedOrder(
                tool.getId(), 
                "Mantenimiento Predictivo Obligatorio: " + (finalMeterReading - tool.getLastServiceHours()) + " horas acumuladas sin servicio."
            );
        }
    }
}
```

---

## 🎓 Pregunta de Examen y Argumento de Defensa

* **Pregunta del Profesor:** *"¿Por qué esta lógica pertenece a la capa de Dominio (`renta-domain`) y no a un trigger de PostgreSQL o a un controlador REST?"*
* **Respuesta de 10:** *"En Arquitectura Hexagonal y DDD, las reglas de negocio sobre la integridad de los activos (como el umbral de vida útil de un motor) son invariantes de dominio puras. Si estuvieran en un trigger SQL, perderíamos testabilidad unitaria en Java; y si estuvieran en un Controller, se violaría el principio de responsabilidad única (SRP)."*
