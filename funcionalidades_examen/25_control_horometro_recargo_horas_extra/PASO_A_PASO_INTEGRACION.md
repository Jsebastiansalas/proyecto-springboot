# 📋 Funcionalidad 25: Control de Horómetro / Odómetro y Recargo por Horas Extra de Motor (Telemetría Industrial)

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Patrón de Diseño:** Usage-Based Telemetry & Overtime Engine Pattern  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Módulos Involucrados:** `renta-domain` · `renta-infrastructure` · `frontend/React`

---

## 🎯 ¿Qué problema de negocio resuelve?
En maquinaria pesada con motor diésel o eléctrico (plantas eléctricas, retroexcavadoras, compresores de tornillo, rodillos vibratorios), el desgaste mecánico y el consumo de aceite no dependen de los días de calendario sino de las **horas reales de trabajo del motor** registradas en el horómetro:
1. **Abuso de Máquinas por Múltiples Turnos:** Un cliente alquila por 3 días pagando tarifa de turno sencillo (8h/día = 24h), pero opera la máquina en 3 turnos rotativos (24h continuas al día = 72h), triplicando el desgaste sin pagar al proveedor.
2. **Justicia Contractual:** La tarifa estándar cubre hasta 8 horas diarias de operación. Cualquier hora adicional debe liquidarse como sobreuso (*overtime engine hours*).
3. **Control Automático en Acta de Devolución:** El sistema compara el horómetro inicial registrado en el despacho contra el horómetro final en la recepción técnica y liquida el excedente al instante.

---

## 🧮 Algoritmo Matemático de Liquidación por Horómetro

$$\text{Horas Máximas Contratadas} = \text{Días de Alquiler} \times 8\text{ horas/día}$$
$$\text{Horas Trabajadas Reales} = \text{Horómetro Final} - \text{Horómetro Inicial}$$
$$\text{Horas Extra de Motor} = \max(0, \text{Horas Trabajadas Reales} - \text{Horas Máximas Contratadas})$$
$$\text{Recargo por Sobreuso} = \text{Horas Extra de Motor} \times \text{Tarifa Hora Extra (COP)}$$

### Ejemplo de Liquidación:
- **Alquiler:** 4 días de Generador Diésel Caterpillar.
- **Horómetro Inicial (Despacho):** $120.0\text{ hrs}$.
- **Horómetro Final (Retorno):** $165.0\text{ hrs}$.
- **Horas Reales de Motor:** $165.0 - 120.0 = 45.0\text{ hrs}$.
- **Horas Cubiertas en Contrato:** $4\text{ días} \times 8\text{ h} = 32.0\text{ hrs}$.
- **Horas Extra:** $45.0 - 32.0 = \mathbf{13.0\text{ horas extra}}$.
- **Recargo ($25.000 COP/h):** $13 \times \$ 25.000 = \mathbf{\$ 325.000\text{ COP}}$ cobrados en el acta de devolución.

---

## 🏗️ Ubicación de los Componentes en el Proyecto

### 1. Base de Datos (PostgreSQL)
- **Tablas:** `rental_deliveries` (campo `initial_condition_notes` / horas) y `rental_returns` (campo `inspection_notes` / horas).

### 2. Frontend React 18
- **Pestaña de Telemetría IoT en Ficha Técnica ([ToolDetailModal.tsx](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/frontend/src/components/catalog/ToolDetailModal.tsx)):**
  - Muestra en tiempo real: Horómetro actual, horas restantes para cambio de aceite y filtro, temperatura del bloque y nivel de vibración.
- **Formulario de Recepción en Patio ([ReturnInspectionModal.tsx](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/frontend/src/components/provider/ReturnInspectionModal.tsx)):**
  - Entrada de horómetro final y cálculo en vivo del recargo por horas extra.

---

## 🔌 Endpoints REST

- **POST** `/api/v1/returns`
- **Request con Liquidación de Horas Extra:**
```json
{
  "reservationId": 1,
  "receivedBy": "Ing. Gustavo Morales",
  "toolConditionStatus": "BUENO",
  "inspectionNotes": "Horómetro final: 165.0 hrs. Horas extra detectadas: 13.0 hrs.",
  "depositRefunded": true,
  "extraDamageFee": 325000.00
}
```

---

## 💡 Defensa en el Examen (Argumentos Técnicos)
- **Estándar Caterpillar & Komatsu:** "Emula los sistemas telemáticos corporativos de fabricantes de maquinaria pesada, donde la telemetría IoT y los horómetros son la base legal de los contratos de arrendamiento operativo."
- **Protección de la Vida Útil de la Flota:** "Evita que contratistas sobreexploten la maquinaria en doble y triple turno sin compensar el desgaste de los componentes mecánicos."
