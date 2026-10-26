# 📋 Funcionalidad 39: Tarificación por Régimen de Turnos (Diurno 8h, Doble Turno 16h y Continuo 24/7)

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Patrón de Diseño:** Shift-Based Work Factor Pricing Pattern  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Módulos Involucrados:** `renta-domain` · `renta-application` · `frontend/React`

---

## 🎯 ¿Qué "Cáscara" o Pregunta Trampa del Profesor Resuelve?
En obras de infraestructura de alta exigencia (Metro de Bogotá, túneles viales, minería o pavimentación nocturna):
> *"Una constructora alquila un generador trifásico de 100 kVA. Pero no lo va a apagar a las 5:00 PM: la obra trabaja las 24 horas continuas con 3 cuadrillas rotativas."*
> *"¿Le cobras lo mismo que a un contratista que solo trabaja 8 horas de lunes a viernes? ¿Cómo modelas el factor de desgaste acelerado de lubricantes, filtros y componentes según el régimen de turnos contratado?"*

### La Solución Arquitectónica:
El cálculo de cotización incorpora el **Factor Multiplicador de Turno Operativo**:
1. **Turno Sencillo Diurno (8 horas/día):** Factor $\times 1.0$ (Tarifa Base).
2. **Doble Turno (16 horas/día):** Factor $\times 1.65$ (+65% sobre la tarifa base; no se cobra el doble por economía de escala).
3. **Triple Turno / Operación Continua (24 horas/día):** Factor $\times 2.20$ (+120% sobre la tarifa base, incluye kit de cambio de aceite bisemanal y soporte técnico 24/7).

---

## 🧮 Algoritmo de Liquidación por Régimen de Turno

$$\text{Tarifa Diaria Ajustada} = \text{Tarifa Base} \times \text{Factor de Turno}$$
$$\text{Horas de Motor Contratadas} = \text{Días de Alquiler} \times \text{Horas del Turno}$$

| Régimen de Turno | Horas Diarias | Factor Multiplicador | Ejemplo Tarifa Diaria Base ($150.000) |
| :--- | :---: | :---: | :---: |
| **`TURNO_SENCILLO_8H`** | 8 h | $1.00$ | **$150.000 COP / día** |
| **`DOBLE_TURNO_16H`** | 16 h | $1.65$ | **$247.500 COP / día** |
| **`TRIPLE_TURNO_24H`** | 24 h | $2.20$ | **$330.000 COP / día** |

```java
package com.rentamaq.domain.model;

public enum WorkShiftMode {
    TURNO_SENCILLO_8H(1.00, 8),
    DOBLE_TURNO_16H(1.65, 16),
    TRIPLE_TURNO_24H(2.20, 24);

    private final double priceMultiplier;
    private final int maxDailyHours;

    WorkShiftMode(double priceMultiplier, int maxDailyHours) {
        this.priceMultiplier = priceMultiplier;
        this.maxDailyHours = maxDailyHours;
    }

    public double calculateAdjustedDailyRate(double baseDailyRate) {
        return Math.round(baseDailyRate * this.priceMultiplier);
    }

    public int calculateTotalContractedHours(int totalDays) {
        return totalDays * this.maxDailyHours;
    }
}
```

---

## 🏗️ Integración en la Reserva y Contrato

1. El selector de turno se despliega en el cotizador cuando la máquina pertenece a las categorías de **Maquinaria Pesada**, **Generación Eléctrica** o **Compresores**.
2. Al firmar el contrato (Funcionalidad 26), se estipula la cláusula contractual de jornada máxima autorizada.
3. Si el cliente contrató `TURNO_SENCILLO_8H` pero el horómetro final demuestra que operó 20 horas al día, el sistema liquida la diferencia como sobreuso no autorizado con recargo penal.

---

## 🎓 Pregunta de Examen y Argumento de Defensa

* **Pregunta del Profesor:** *"¿Por qué el factor de 24 horas continuas es 2.20 y no 3.0 (el triple exacto de 8 horas)?"*
* **Respuesta de 10:** *"En la industria del alquiler de maquinaria pesada rige el principio de costo marginal decreciente: el costo de amortización y transporte es el mismo sin importar cuántas horas trabaje la máquina al día. Solo aumentan el desgaste y consumibles, por lo que una tarifa de factor 2.20 es competitiva comercialmente y altamente rentable para el patio proveedor."*
