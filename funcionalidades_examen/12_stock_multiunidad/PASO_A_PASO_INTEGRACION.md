# Guía de Integración y Examen: Control de Stock Multi-Unidad y Prevención de Overbooking

## 📌 Enunciado Típico de Examen
> *"Actualmente cada herramienta solo permitía una reserva a la vez. Modifique el sistema para que las herramientas tengan un stock de unidades disponibles (ej. un taladro o generador puede tener 4 unidades físicas). Permita que múltiples clientes reserven la misma máquina en fechas concurrentes siempre y cuando la cantidad de reservas activas (APROBADA o EN_CURSO) no supere el inventario total."*

---

## 🏛️ Componentes y Arquitectura Hexagonal

### 1. Base de Datos (PostgreSQL)
```sql
ALTER TABLE tools ADD COLUMN IF NOT EXISTS stock_quantity INT DEFAULT 1;
```

### 2. Dominio (`renta-domain`)
* **Entidad:** `Tool.java`
  - Atributo `Integer stockQuantity` con getter/setter y valor por defecto `1`.

### 3. Aplicación (`renta-application`)
* **Servicio:** `ReservationApplicationService.java`
  - Si `tool.getStockQuantity() <= 1`: utiliza la validación binaria existente de no-solapamiento (`reservationRepository.existsOverlapping(...)`).
  - Si `tool.getStockQuantity() > 1`: consulta `reservationRepository.findOverlappingReservations(...)`. Si el total de reservas concurrentes activas alcanza o supera el `stockQuantity`, lanza `ReservationConflictException("La herramienta ya tiene X de Y unidades reservadas en esas fechas")`.

### 4. Infraestructura (`renta-infrastructure`)
* Mapeado en `ToolJpaEntity.java`, `ToolJpaMapper.java` y `SpringDataReservationRepository.java`.

---

## 🚀 Cómo Defenderlo en el Examen
1. **Control de concurrencia y sobreventa (Overbooking):** Se previene el conflicto evaluando el inventario total contra las reservas aprobadas/en curso en el mismo intervalo de tiempo.
2. **Backward Compatibility:** Si una herramienta tiene `stockQuantity == null` o `1`, el comportamiento clásico se preserva sin regresiones.
