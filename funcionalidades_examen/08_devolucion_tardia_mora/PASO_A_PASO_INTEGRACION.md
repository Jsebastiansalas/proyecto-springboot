# Guía de Integración y Examen: Devolución Tardía y Cobro de Mora (Late Return Settlement)

## 📌 Enunciado Típico de Examen
> *"Al registrar la devolución física de la herramienta en el módulo de entregas, si la fecha real de retorno es posterior a la fecha pactada en el contrato de reserva, el sistema debe calcular de forma automática una penalización por mora (días de retraso × tarifa diaria × 1.5). Este valor debe liquidarse contra la fianza en custodia del cliente: si la fianza cubre la mora se reembolsa la diferencia; si la fianza es insuficiente, se genera un saldo pendiente de cobro (deuda)."*

---

## 🏛️ Componentes y Arquitectura Hexagonal

### 1. Dominio (`renta-domain`)
* **Value Object:** `LateReturnSettlement.java` en `com.renta.domain.model.vo`.
  - Inmutable. Modela: `lateDays`, `dailyRate`, `penaltyMultiplier` (1.5), `totalPenaltyAmount`, `originalDepositAmount`, `refundedDepositAmount`, `pendingClientDebt`.
* **Domain Service:** `LateReturnPolicy.java` en `com.renta.domain.service`.
  - Regla matemática pura sin dependencias de frameworks (`ChronoUnit.DAYS.between`).
  - Cobertura de pruebas unitarias al 100% en `LateReturnPolicyTest.java`.

### 2. Aplicación (`renta-application`)
* **DTO de Respuesta:** `LateReturnSettlementResponse.java` en `com.renta.application.dto.delivery`.
* **Caso de Uso / Servicio:** `DeliveryReturnApplicationService.calculateLateReturnSettlement(Long reservationId, LocalDate actualReturnDate)`.

### 3. Infraestructura (`renta-infrastructure`)
* **Controlador REST:** `DeliveryReturnController.java`
* **Endpoint:** `GET /api/v1/returns/late-settlement/{reservationId}?actualReturnDate=YYYY-MM-DD`

---

## 🚀 Cómo Defenderlo en el Examen
1. **Separación de responsabilidades:** La fórmula del cálculo de mora (`tarifa * días * 1.5`) reside en el **Domain Service** `LateReturnPolicy`, no en el controlador ni en base de datos.
2. **Uso de Value Objects:** Se utiliza `Money` para evitar errores de precisión de punto flotante en finanzas.
3. **Casos borde:** Retorno a tiempo (0 días de mora → reembolso del 100% de la fianza), retraso menor cubierto por fianza, retraso severo con deuda generada.
