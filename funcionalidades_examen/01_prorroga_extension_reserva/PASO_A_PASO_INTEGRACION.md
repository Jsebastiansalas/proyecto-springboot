# 📋 Funcionalidad 1: Prórroga / Extensión de Alquiler de Reserva

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).

---

## 🎯 ¿Qué problema de negocio resuelve?
Permite a un cliente o contratista extender la duración de una reserva activa (`APROBADA` o `EN_CURSO`) indicando una nueva fecha de finalización y el motivo. El sistema:
1. Valida que la nueva fecha sea estrictamente posterior a la actual.
2. Comprueba en el calendario que la maquinaria no tenga otra reserva confirmada en ese rango extendido (`findOverlappingReservations`).
3. Recalcula el subtotal por los días adicionales según la tarifa diaria base de la herramienta.
4. Aplica el IVA legal (19%) sobre el costo adicional.
5. Actualiza la fecha fin, total de días, subtotal, total y registra en las notas el motivo de la prórroga.

---

## 🏗️ Ubicación de los Componentes en el Proyecto

### 1. Módulo Dominio (`renta-domain`)
- **Puerto de Entrada:** [ExtendReservationUseCase.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-domain/src/main/java/com/renta/domain/port/in/ExtendReservationUseCase.java)

### 2. Módulo Aplicación (`renta-application`)
- **DTO Request:** [ExtendReservationRequest.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-application/src/main/java/com/renta/application/dto/reservation/ExtendReservationRequest.java)
- **DTO Response:** [ReservationExtensionResponse.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-application/src/main/java/com/renta/application/dto/reservation/ReservationExtensionResponse.java)
- **Servicio de Aplicación:** [ReservationApplicationService.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-application/src/main/java/com/renta/application/service/ReservationApplicationService.java) (`extendReservation` y `extendReservationAndGetResponse`)

### 3. Módulo Infraestructura (`renta-infrastructure`)
- **Controlador REST:** [ReservationController.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/adapter/in/rest/ReservationController.java) (Endpoint `@PatchMapping("/{id:[0-9]+}/extend")`)

---

## 🔌 Endpoint REST

- **Método HTTP:** `PATCH`
- **Ruta:** `/api/v1/reservations/{id}/extend`
- **Seguridad:** Requiere token Bearer JWT (`ROLE_CLIENTE`, `ROLE_PROVEEDOR` o `ROLE_ADMIN`).

### Ejemplo de Request Payload:
```json
{
  "newEndDate": "2026-11-20",
  "reason": "Retraso en el cronograma de obra por condiciones climáticas"
}
```

### Ejemplo de Respuesta Exitosa (`200 OK`):
```json
{
  "reservationId": 1,
  "reservationCode": "RES-2026-A1B2C3",
  "originalEndDate": "2026-11-10",
  "newEndDate": "2026-11-20",
  "additionalDays": 10,
  "totalDays": 20,
  "additionalCost": 1200000.00,
  "additionalIva": 228000.00,
  "newSubtotal": 2400000.00,
  "newTotalAmount": 3156000.00,
  "status": "APROBADA",
  "reason": "Retraso en el cronograma de obra por condiciones climáticas",
  "message": "Prórroga de alquiler procesada exitosamente."
}
```

---

## 💡 Defensa en el Examen (Argumentos Técnicos)
- **Principio de Responsabilidad Única (SRP):** La validación de conflicto de fechas se delega al repositorio de reservas reutilizando el Value Object `DateRange`.
- **Inmutabilidad de Dinero:** Los cálculos financieros utilizan el Value Object `Money` y `BigDecimal` para evitar errores de redondeo de punto flotante.
- **Transaccionalidad:** La extensión se realiza de forma atómica bajo `@Transactional` para garantizar consistencia entre el calendario y los saldos.
