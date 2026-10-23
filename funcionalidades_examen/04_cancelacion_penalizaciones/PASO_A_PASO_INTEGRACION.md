# 📋 Funcionalidad 4: Cancelación de Reservas con Penalización Financiera

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Base de Datos:** Columnas `cancellation_penalty` y `refunded_amount` agregadas a `reservations`.

---

## 🎯 ¿Qué problema de negocio resuelve?
Implementa una política financiera de cancelación escalonada según la anticipación con la que el cliente solicita cancelar respecto a la fecha y hora de inicio del alquiler:
- **Más de 48 horas de anticipación:** Penalización del **0%** (Reembolso del 100% del subtotal y del 100% de la fianza).
- **Entre 24 y 48 horas:** Penalización del **20%** sobre el valor del alquiler (se reembolsa el 80% del alquiler y 100% del depósito).
- **Entre 12 y 24 horas:** Penalización del **50%** sobre el valor del alquiler (se reembolsa el 50% del alquiler y 100% del depósito).
- **Menos de 12 horas o fecha ya iniciada:** Penalización del **100%** del valor del alquiler (se retiene todo el subtotal; **el depósito de garantía siempre se reintegra al 100%**).

---

## 🏗️ Ubicación de los Componentes en el Proyecto

### 1. Módulo Dominio (`renta-domain`)
- **Servicio de Dominio Puro:** [CancellationPolicy.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-domain/src/main/java/com/renta/domain/service/CancellationPolicy.java)
- **Value Object (Record):** [CancellationSettlement.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-domain/src/main/java/com/renta/domain/model/vo/CancellationSettlement.java)

### 2. Módulo Aplicación (`renta-application`)
- **DTOs:** [CancelWithPenaltyRequest.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-application/src/main/java/com/renta/application/dto/reservation/CancelWithPenaltyRequest.java) y [CancellationPenaltyResponse.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-application/src/main/java/com/renta/application/dto/reservation/CancellationPenaltyResponse.java)
- **Servicio de Aplicación:** [ReservationApplicationService.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-application/src/main/java/com/renta/application/service/ReservationApplicationService.java) (`cancelWithFinancialSettlement`)

### 3. Módulo Infraestructura (`renta-infrastructure`)
- **Controlador REST:** [ReservationController.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/adapter/in/rest/ReservationController.java) (Endpoint `@PatchMapping("/{id:[0-9]+}/cancel-with-penalty")`)

---

## 🔌 Endpoint REST

- **Método HTTP:** `PATCH`
- **Ruta:** `/api/v1/reservations/{id}/cancel-with-penalty`
- **Seguridad:** Requiere token Bearer JWT (`ROLE_CLIENTE`, `ROLE_PROVEEDOR` o `ROLE_ADMIN`).

### Ejemplo de Request Payload:
```json
{
  "reason": "Suspensión imprevista de la obra por paro de transporte"
}
```

### Ejemplo de Respuesta Exitosa (`200 OK`):
```json
{
  "reservationId": 1,
  "reservationCode": "RES-2026-A1B2C3",
  "previousStatus": "APROBADA",
  "currentStatus": "CANCELADA",
  "originalTotalAmount": 714000.00,
  "penaltyPercentage": 20.00,
  "penaltyFeeAmount": 120000.00,
  "refundedDepositAmount": 300000.00,
  "totalRefundedToClient": 594000.00,
  "policyExplanation": "Cancelación con 36 horas de anticipación: Penalización del 20.0% sobre el valor del alquiler.",
  "reason": "Suspensión imprevista de la obra por paro de transporte"
}
```

---

## 💡 Defensa en el Examen (Argumentos Técnicos)
- **Separación de Responsabilidades:** La tabla de penalizaciones reside exclusivamente en el Dominio (`CancellationPolicy`), libre de frameworks, facilitando pruebas unitarias exhaustivas con JUnit 5 simulando diferentes instantes en el tiempo.
- **Protección de la Fianza de Garantía:** La fianza (depósito de garantía) nunca se confisca por cancelación anticipada; solo cubre siniestros físicos del equipo, demostrando coherencia jurídica y financiera.
