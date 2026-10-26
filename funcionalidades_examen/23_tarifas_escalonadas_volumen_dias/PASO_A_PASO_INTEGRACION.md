# 📋 Funcionalidad 23: Tarifas Escalonadas por Volumen de Días (Pricing Tiers Semanal / Mensual)

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Patrón de Diseño:** Tiered Volume Pricing Strategy  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Base de Datos:** Tabla `tool_pricing_tiers` con tarifas escalonadas pre-configuradas.

---

## 🎯 ¿Qué problema de negocio resuelve?
En proyectos de ingeniería civil y construcción pesada, un alquiler por 30 o 60 días no puede cobrarse a la misma tarifa diaria unitaria que un alquiler de 1 día:
1. **Pérdida de Contratos Corporativos:** Si el sistema cobra tarifa plana, las constructoras optan por comprar la máquina o alquilar con proveedores que ofrecen tarifas preferenciales de larga estancia.
2. **Optimización de Rotación:** Alquilar un equipo por 1 mes continuo reduce los costos logísticos de inspección, alistamiento y fletes repetitivos.
3. **Automatización del Cotizador:** El sistema debe detectar automáticamente cuántos días abarca la cotización y aplicar la tarifa escalonada correspondiente (`DIARIA`, `SEMANAL >= 7 días`, `MENSUAL >= 30 días`).

---

## 📊 Matriz de Escalafón Tarifario

| Nivel de Tarifa (Tier) | Días Mínimos | Descuento Equivalente | Ejemplo (Generador Diésel) |
| :--- | :---: | :---: | :---: |
| **Tarifa Diaria Estándar** | 1 a 6 días | 0% (Precio Base) | $\$ 120.000\text{ COP / día}$ |
| **Tarifa Semanal (`SEMANAL`)** | 7 a 29 días | **-15% a -20%** | **$\$ 102.000\text{ COP / día}$** |
| **Tarifa Mensual (`MENSUAL`)** | $\ge 30$ días | **-30% a -35%** | **$\$ 84.000\text{ COP / día}$** |

---

## 🏗️ Ubicación de los Componentes en el Proyecto

### 1. Base de Datos (PostgreSQL)
- **Tabla:** `tool_pricing_tiers`
```sql
CREATE TABLE IF NOT EXISTS tool_pricing_tiers (
    id BIGSERIAL PRIMARY KEY,
    tool_id BIGINT NOT NULL,
    tier_type VARCHAR(50) NOT NULL,
    min_days INTEGER NOT NULL CHECK (min_days > 0),
    price_per_day NUMERIC(12,2) NOT NULL CHECK (price_per_day > 0),
    CONSTRAINT uq_tool_tier UNIQUE (tool_id, tier_type),
    CONSTRAINT fk_tool_pricing_tool FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
);
```

### 2. Capa de Infraestructura (`renta-infrastructure`)
- **Entidad JPA:** [ToolPricingTierJpaEntity.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/adapter/out/persistence/entity/ToolPricingTierJpaEntity.java)
- **Cotizador de Precios:** [RentalPricingCalculator.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-domain/src/main/java/com/renta/domain/service/RentalPricingCalculator.java)

---

## 🔌 Endpoints REST

### 1. Cotizar Alquiler con Detección Automática de Tier
- **POST** `/api/v1/reservations/calculate-price`
- **Request (Alquiler de 10 días):**
```json
{
  "toolId": 2,
  "startDate": "2026-11-01",
  "endDate": "2026-11-10",
  "hasDamageInsurance": false
}
```
- **Respuesta (`200 OK`):**
```json
{
  "totalDays": 10,
  "baseDailyRate": 120000.00,
  "appliedDailyRate": 102000.00,
  "tierApplied": "SEMANAL",
  "discountPerDay": 18000.00,
  "totalSavings": 180000.00,
  "subtotal": 1020000.00,
  "taxIva": 193800.00,
  "totalPrice": 1213800.00
}
```

---

## 🖥️ Interfaz de Usuario (React 18)

1. **Badge en Catálogo de Maquinaria ([ToolCard.tsx](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/frontend/src/components/catalog/ToolCard.tsx)):**
   - Muestra el distintivo: *"Ahorra hasta 15% desde 7 días"*.
2. **Cotizador Reactivo en el Carrito ([QuoteCartDrawer.tsx](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/frontend/src/components/quote/QuoteCartDrawer.tsx)):**
   - Al mover el control deslizante o ingresar 7 o más días, la tarifa unitaria cambia dinámicamente reflejando el precio `SEMANAL` con una etiqueta verde de ahorro.

---

## 💡 Defensa en el Examen (Argumentos Técnicos)
- **Estrategia Comercial de Alta Rentabilidad:** "Incentiva alquileres de mayor duración garantizando flujo de caja estable y reduciendo tiempos muertos de inventario en patio."
- **Inmutabilidad y Control Relacional:** "Las tarifas escalonadas están normalizadas en su propia entidad relacional con claves foráneas en cascada, evitando hardcoding de precios en el frontend o controladores."
