# Guía de Integración y Examen: Tarifas Dinámicas con Recargo de Fin de Semana

## 📌 Enunciado Típico de Examen
> *"Modifique el motor de liquidación de alquileres para aplicar tarifas dinámicas: los días que caigan en fin de semana (sábados y domingos) deben facturarse con un recargo del 20% respecto a la tarifa diaria regular. Si el alquiler dura 7 o más días, debe seguir aplicando el 15% de descuento por semana completa sobre el subtotal resultante."*

---

## 🏛️ Componentes y Arquitectura Hexagonal

### 1. Dominio (`renta-domain`)
* **Domain Service:** `RentalPricingCalculator.java`
  - Método `calculateWithWeekendSurcharge(Money baseDailyPrice, Money baseDeposit, LocalDate startDate, LocalDate endDate, BigDecimal weekendSurchargeRate, boolean includeDamageInsurance)`.
  - Itera el rango de fechas con `startDate.datesUntil(endDate.plusDays(1))`.
  - Evalúa `day.getDayOfWeek() == DayOfWeek.SATURDAY || day.getDayOfWeek() == DayOfWeek.SUNDAY`.
  - Días de semana: `tarifaBase`.
  - Fin de semana: `tarifaBase * (1 + 0.20)`.
* **Pruebas Unitarias JUnit 5:** `RentalPricingCalculatorTest.java`
  - `testCalculateWithWeekendSurcharge()`: Valida alquiler de 3 días (Viernes, Sábado y Domingo).
  - Comprueba exactitud matemática sin desbordamiento ni errores de redondeo.

---

## 🚀 Cómo Defenderlo en el Examen
1. **Manejo del API java.time:** Demuestra dominio de `LocalDate`, `DayOfWeek` y streams funcionales con `datesUntil`.
2. **Pureza de Dominio:** Cero dependencias externas o de base de datos; el cálculo es determinista y testeable en microsegundos.
