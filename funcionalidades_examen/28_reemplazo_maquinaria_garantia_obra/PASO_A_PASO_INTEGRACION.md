# 📋 Funcionalidad 28: Solicitud de Cambio de Herramienta por Falla en Obra (Swap en Garantía)

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Patrón de Diseño:** Equipment Hot-Swap & Warranty Fulfillment Pattern  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Módulos Involucrados:** `renta-application` · `renta-infrastructure` · `frontend/React`

---

## 🎯 ¿Qué problema de negocio resuelve?
En una obra civil, si un compresor o mezcladora deja de funcionar por falla mecánica inherente al equipo (falla eléctrica interna, desgaste de rodamientos):
1. **Paralización de Obra:** El tiempo de fraguado del concreto o el cronograma de fundición no puede esperar días a que el taller repare la máquina.
2. **Injusticia Financiera:** El cliente no debe verse forzado a crear un nuevo contrato, pagar flete doble ni abonar un nuevo depósito de garantía.
3. **Mecanismo de Sustitución Inmediata (Hot-Swap):** El contratista solicita la sustitución en garantía desde el portal; el proveedor asigna otra unidad disponible de la flota y despacha el reemplazo inmediatamente, transfiriendo el contrato activo sin costos adicionales.

---

## 🔄 Flujo Operativo del Hot-Swap

1. **Solicitud de Garantía:** El cliente reporta *"Falla de potencia en motor - Equipo inoperativo"*.
2. **Verificación de Inventario:** El sistema busca una unidad idéntica o equivalente en estado `DISPONIBLE` en el mismo patio.
3. **Reasignación Atómica:**
   - La máquina fallida se traslada a estado `MANTENIMIENTO` (generando orden de taller preventiva).
   - La máquina de reemplazo se vincula a la reserva vigente manteniendo los mismos días restantes y la fianza original.
   - Se emite una **Adenda al Acta de Despacho 4FN** con el nuevo serial/código de la máquina entregada.

---

## 🏗️ Ubicación de los Componentes en el Proyecto

### 1. Módulo Aplicación (`renta-application`)
- **Servicio:** [ReservationApplicationService.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-application/src/main/java/com/renta/application/service/ReservationApplicationService.java) con método de sustitución de equipo en garantía.

### 2. Frontend React 18
- **Acción en Portal de Cliente ([ClientPortal.tsx](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/frontend/src/components/client/ClientPortal.tsx)):**
  - Botón *"Solicitar Reemplazo en Garantía"* en contratos en curso.

---

## 🔌 Endpoints REST

- **POST** `/api/v1/reservations/{id}/swap-tool`
- **Request:**
```json
{
  "failureReason": "Pérdida de presión en cabezal compresor tras 2 horas de uso continuo",
  "requestedUrgency": "ALTA_INMEDIATA",
  "contactPhoneOnSite": "+57 312 456 7890"
}
```
- **Respuesta Exitosa (`200 OK`):**
```json
{
  "reservationId": 1,
  "originalToolCode": "COMP-50L-01",
  "assignedReplacementToolCode": "COMP-50L-03",
  "status": "SWAP_APROBADO_EN_DESPACHO",
  "additionalCost": 0.00,
  "message": "Reemplazo en garantía aprobado sin costo adicional. Unidad COMP-50L-03 programada para entrega prioritaria."
}
```

---

## 💡 Defensa en el Examen (Argumentos Técnicos)
- **Continuidad de Servicio (SLA):** "Garantiza un Acuerdo de Nivel de Servicio (SLA) de menos de 4 horas en obra civil, posicionando al software como una plataforma de soporte crítico a la infraestructura."
- **Atomicidad y Consistencia:** "La reasignación de la herramienta y el traspaso del equipo original a taller se realizan en una sola transacción ACID para evitar duplicidad de inventario."
