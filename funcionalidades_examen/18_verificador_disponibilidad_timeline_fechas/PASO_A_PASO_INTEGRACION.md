# 📋 Funcionalidad 18: Verificador Interactivo de Disponibilidad & Timeline de Ocupación

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Concepto Teórico:** Detección de Colisión de Intervalos Cerrados & Prevención de Overbooking  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Módulos Involucrados:** `renta-domain` · `renta-infrastructure` · `frontend/React`

---

## 🎯 ¿Qué problema de negocio resuelve?
En una plataforma de alquiler de maquinaria pesada y equipos industriales, el error operativo más costoso es el **overbooking** (doble reserva para la misma máquina en las mismas fechas) o comprometer una entrega cuando el equipo tiene programada una intervención en taller para calibración o cambio de piezas.

Para garantizar la satisfacción del cliente y la integridad operativa:
1. El cliente debe poder comprobar si una herramienta está libre en las fechas exactas de su cuadrilla antes de cotizar.
2. La plataforma debe cruzar en tiempo real **tanto las reservas activas como las órdenes de taller técnico**.

---

## 📐 Fundamento Matemático y Lógica de No-Solapamiento

En teoría de conjuntos, dos intervalos cerrados de fechas $[S_1, E_1]$ y $[S_2, E_2]$ **se solapan si y solo si**:

$$S_1 \le E_2 \quad \land \quad E_1 \ge S_2$$

Si esta condición se cumple, existe al menos un día en común y la reserva no puede efectuarse.

### Implementación en el Dominio Java (`renta-domain`):
En el Value Object inmutable [DateRange.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-domain/src/main/java/com/renta/domain/model/vo/DateRange.java):
```java
public boolean overlapsWith(DateRange other) {
    if (other == null) return false;
    return !this.startDate.isAfter(other.endDate) && !this.endDate.isBefore(other.startDate);
}
```

---

## 🏗️ Ubicación de los Componentes en el Proyecto

### 1. Módulo Dominio (`renta-domain`)
- Value Object: [DateRange.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-domain/src/main/java/com/renta/domain/model/vo/DateRange.java)

### 2. Módulo Infraestructura (`renta-infrastructure`)
- **Consulta de Fechas Ocupadas por Alquileres:**
  - `GET /api/v1/reservations/tool/{toolId}/occupied-dates`
- **Consulta de Bloqueos por Mantenimiento:**
  - `GET /api/v1/tools/maintenance/tool/{toolId}`

---

## 🖥️ Componente Interactivo en el Frontend (React 18)

En la ficha técnica de cada herramienta ([ToolDetailModal.tsx](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/frontend/src/components/common/ToolDetailModal.tsx)), dentro de la pestaña **"Disponibilidad en Patio"**:

### 1. Verificador Algorítmico en Tiempo Real:
- El contratista ingresa `Fecha Inicio Deseada` y `Fecha Fin Deseada` y pulsa **"Comprobar Fechas"**:
  - **Si hay conflicto:** Muestra un banner rojo indicando la reserva o bloqueo en conflicto:
    > *"Conflicto de fechas con reserva activa RES-2026-0042 (2026-10-24 a 2026-10-27). Por favor elige otro intervalo."*
  - **Si está libre:** Muestra un banner verde confirmando:
    > *"¡Equipo 100% disponible! Puedes solicitar el despacho en obra para las fechas seleccionadas."*

### 2. Cronograma de Ocupación por Alquileres:
- Lista cronológica de todas las reservas vigentes asociadas a la herramienta con sus fechas de inicio y fin.

### 3. Cronograma de Bloqueos de Taller:
- Si el equipo tiene mantenimientos activos (ej. calibración RETIE o cambio de fluidos), muestra las fechas bloqueadas y el técnico a cargo.

---

## 💡 Defensa en el Examen (Argumentos Técnicos)
- **Validación en Doble Capa:** La verificación inmediata en frontend ahorra tiempo al usuario, mientras que el backend garantiza la atomicidad y control concurrente mediante `findOverlappingReservations` en `ReservationApplicationService`.
- **Inmutabilidad y DDD:** El uso de Value Objects inmutables (`DateRange`) para el cálculo de solapamiento garantiza pruebas unitarias deterministas sin efectos secundarios.
