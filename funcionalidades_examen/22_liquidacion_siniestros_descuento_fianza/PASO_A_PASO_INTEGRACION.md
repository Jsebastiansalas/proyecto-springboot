# 📋 Funcionalidad 22: Liquidación de Siniestros y Descuento de Fianza Escrow en Devolución Técnica

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Patrón de Diseño:** Escrow Claim & Financial Balance Settlement Pattern  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Base de Datos:** Tablas `damage_reports`, `rental_returns` y `reservations`.

---

## 🎯 ¿Qué problema de negocio resuelve?
En el alquiler de maquinaria pesada, el equipo opera en ambientes hostiles (polvo, vibración, sobrecargas). Si una máquina regresa con averías mecánicas, piezas rotas o faltantes:
1. **Falta de Procedimiento de Cobro:** Sin un flujo formal, el proveedor asume el costo de la reparación o entra en conflicto verbal con el cliente.
2. **Uso de la Fianza Escrow:** La fianza retenida al momento del pago existe precisamente para cubrir siniestros sin requerir trámites judiciales inmediatos.
3. **Liquidación Numérica Transparente:** El sistema debe registrar el reporte técnico del daño, estimar el costo de repuestos/taller, descontarlo de la fianza y devolver el saldo restante (o emitir una cuenta de cobro si el daño excede el depósito).

---

## 🧮 Lógica Financiera de Liquidación

$$\text{Balance de Fianza} = \text{Depósito Escrow} - \text{Costo de Reparación} - \text{Multa por Mora}$$

1. **Caso Saldo a Favor del Cliente ($\text{Balance} > 0$):**
   - Se deduce el costo del daño para transferirlo al patio proveedor.
   - El saldo remanente se reembolsa automáticamente a la tarjeta/cuenta del cliente.
   - Estado del reporte de daño: `APROBADO_DESCONTADO`.
2. **Caso Siniestro Total o Daño Mayor ($\text{Balance} < 0$):**
   - La fianza se confisca al 100%.
   - Se emite una cuenta de cobro por la diferencia pendiente: $\text{Deuda} = |\text{Balance}|$.
   - Si no se cancela en 5 días, se dispara el bloqueo administrativo del cliente (Funcionalidad 13).

---

## 🏗️ Ubicación de los Componentes en el Proyecto

### 1. Base de Datos (PostgreSQL)
- **Tablas:** `damage_reports` y `rental_returns`
```sql
CREATE TABLE IF NOT EXISTS damage_reports (
    id BIGSERIAL PRIMARY KEY,
    return_id BIGINT NOT NULL,
    reported_by VARCHAR(150) NOT NULL,
    damage_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    repair_cost_estimate NUMERIC(12,2) NOT NULL CHECK (repair_cost_estimate >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'EVALUANDO',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_damages_return FOREIGN KEY (return_id) REFERENCES rental_returns(id) ON DELETE CASCADE
);
```

### 2. Módulo Infraestructura (`renta-infrastructure`)
- **Controlador REST:** [DeliveryReturnController.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/adapter/in/rest/DeliveryReturnController.java)
- **Entidades JPA:** `RentalReturnJpaEntity.java`, `DamageReportJpaEntity.java`

---

## 🔌 Endpoints REST

### 1. Registrar Devolución con Averías y Cobro a Fianza
- **POST** `/api/v1/returns`
```json
{
  "reservationId": 1,
  "receivedBy": "Ing. Gustavo Morales",
  "toolConditionStatus": "CON_DANO",
  "inspectionNotes": "Rotura de carcasa lateral y desgaste excesivo en cable de alimentación 220V.",
  "depositRefunded": false,
  "extraDamageFee": 180000.00
}
```

### 2. Registrar Reporte Técnico Formal de Daño
- **POST** `/api/v1/damages`
```json
{
  "returnId": 1,
  "damageType": "MECANICO",
  "description": "Fisura en carcasa de protección por impacto en obra y cable deshilachado.",
  "repairCostEstimate": 180000.00,
  "reportedBy": "Técnico Especialista Patio Norte"
}
```

### 3. Consultar Liquidación y Reportes de Daño de una Reserva
- **GET** `/api/v1/damages/reservation/{reservationId}`
- **Respuesta Exitosa (`200 OK`):**
```json
{
  "reservationCode": "RES-2026-0042",
  "originalDeposit": 300000.00,
  "repairCost": 180000.00,
  "lateFee": 0.00,
  "netRefundToClient": 120000.00,
  "settlementStatus": "LIQUIDADO_CON_DESCUENTO",
  "damageDescription": "Fisura en carcasa de protección por impacto en obra y cable deshilachado."
}
```

---

## 🖥️ Interfaz de Usuario (React 18)

1. **Modal de Inspección de Retorno ([ReturnInspectionModal.tsx](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/frontend/src/components/provider/ReturnInspectionModal.tsx)):**
   - El técnico selecciona condición: `BUENO`, `REQUIERE_LIMPIEZA` o `CON_DANO`.
   - Si selecciona `CON_DANO`: se despliega el formulario de estimación de repuestos y mano de obra.
   - Calcula en tiempo real: *"Depósito $300.000 - Reparación $180.000 = Reembolso Neto al Cliente $120.000"*.
2. **Reflejo en Libro Fiscal y Trust Score:**
   - Descuenta automáticamente 20 puntos del Trust Score del contratista por siniestro reportado.

---

## 💡 Defensa en el Examen (Argumentos Técnicos)
- **Cierre del Ciclo Fiduciario:** "La fianza no es un cobro a fondo perdido; es un depósito en garantía con custodia temporal. Este flujo garantiza la liquidación matemática exacta de siniestros protegiendo los activos del proveedor y los derechos del cliente."
- **Integridad Transaccional:** "La actualización del estado de retorno, la creación del informe de daños y el ajuste del depósito se ejecutan bajo la anotación `@Transactional` en Spring Boot para garantizar atomicidad."
