# Guía de Integración y Examen: Seguro Opcional Contra Daños (Damage Waiver)

## 📌 Enunciado Típico de Examen
> *"Permita que el cliente, al cotizar o crear una reserva, pueda seleccionar la casilla 'Incluir Seguro Todo Riesgo' (+8% sobre el subtotal de alquiler). Si contrata el seguro, el depósito de garantía exigido se reduce a la mitad (50%), y queda registrado en el contrato de reserva tanto el estado del seguro como el costo liquidado."*

---

## 🏛️ Componentes y Arquitectura Hexagonal

### 1. Base de Datos (PostgreSQL)
```sql
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS has_damage_insurance BOOLEAN DEFAULT FALSE;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS insurance_cost NUMERIC(12, 2) DEFAULT 0.00;
```

### 2. Dominio (`renta-domain`)
* **Value Object:** `RentalPriceCalculation.java` enriquecido con `insuranceCost`.
* **Domain Service:** `RentalPricingCalculator.java`
  - Método sobrecargado `calculate(Money baseDailyPrice, Money baseDeposit, int days, boolean includeDamageInsurance)`.
  - Si `includeDamageInsurance == true`:
    - `costoSeguro = subtotal * 0.08`
    - `depositoExigido = baseDeposit * 0.50`
    - `total = subtotal + IVA (19%) + costoSeguro + depositoExigido`
* **Entidad:** `Reservation.java` con campos `hasDamageInsurance` e `insuranceCost`.

### 3. Aplicación (`renta-application`)
* `CreateReservationRequest.java`: nuevo campo opcional `Boolean includeDamageWaiver`.
* `ReservationApplicationService.java`: traslada el flag al comando de dominio y persiste la reserva con el seguro liquidado.

### 4. Infraestructura (`renta-infrastructure`)
* Persistencia mapeada en `ReservationJpaEntity.java` y `ReservationJpaMapper.java`.
* Expuesto en endpoints `POST /api/v1/reservations/calculate-price` y `POST /api/v1/reservations`.

---

## 🚀 Cómo Defenderlo en el Examen
1. **Inmutabilidad y Backward Compatibility:** La firma existente de `calculate` original sigue intacta llamando a `calculate(..., false)`. Ninguna prueba antigua se rompió.
2. **Impacto Financiero Coherente:** El cálculo del IVA (19%) solo se aplica al servicio de alquiler, mientras el seguro se desglosa como cargo complementario.
