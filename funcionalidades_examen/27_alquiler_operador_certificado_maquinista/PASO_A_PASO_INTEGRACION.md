# 📋 Funcionalidad 27: Alquiler con Operador / Maquinista Certificado Opcional

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Estrategia Operativa:** Value-Added Service & Risk Mitigation Strategy  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Módulos Involucrados:** `renta-domain` · `renta-application` · `frontend/React`

---

## 🎯 ¿Qué problema de negocio resuelve?
Ciertas máquinas pesadas (retroexcavadoras, rodillos compactadores, plataformas de tijera para trabajo en alturas) exigen operadores con **certificación de competencias laborales (SENA) y curso de alturas vigente**:
1. **Falta de Personal Calificado en el Contratista:** Muchas cuadrillas necesitan el equipo pero carecen de maquinistas homologados, arriesgándose a clausuras de obra por parte del Ministerio de Trabajo.
2. **Mitigación de Siniestros para el Proveedor:** Cuando el equipo es operado por un maquinista del propio patio proveedor, las averías por mala praxis caen un 85%.
3. **Servicio de Valor Agregado:** Permite al cliente contratar el paquete integral (*Equipo + Operador Calificado*) por una tarifa fija diaria de turno ($80.000 COP / día).

---

## 🧮 Lógica de Facturación con Operador

$$\text{Costo Total Diario} = \text{Tarifa Diaria Herramienta} + \text{Tarifa Diaria Operador (\$ 80.000 COP)}$$
$$\text{Subtotal} = \text{Costo Total Diario} \times \text{Días de Alquiler}$$

### Ejemplo de Liquidación:
- **Herramienta:** Compresor de Tornillo 185 CFM ($\$ 150.000\text{ COP / día}$).
- **Servicio de Operario Certificado:** Incluido ($\$ 80.000\text{ COP / día}$).
- **Total Diario:** $\$ 230.000\text{ COP / día}$.
- **Duración:** 5 días de obra.
- **Subtotal:** $\$ 1.150.000\text{ COP} + \text{IVA (19\%)} = \mathbf{\$ 1.368.500\text{ COP}}$.

---

## 🏗️ Ubicación de los Componentes en el Proyecto

### 1. Módulo Dominio (`renta-domain`)
- **Entidad:** [Reservation.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-domain/src/main/java/com/renta/domain/model/entity/Reservation.java) con flag `requiresCertifiedOperator` y costo diario de mano de obra.
- **Cotizador:** [RentalPricingCalculator.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-domain/src/main/java/com/renta/domain/service/RentalPricingCalculator.java).

### 2. Frontend React 18
- **Selector en Carrito y Detalle ([QuoteCartDrawer.tsx](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/frontend/src/components/quote/QuoteCartDrawer.tsx)):**
  - Checkbox con distintivo: *"Incluir Operador Técnico Certificado (+ $80.000 / día)"*.

---

## 🔌 Endpoints REST

- **POST** `/api/v1/reservations/calculate-price`
- **Request:**
```json
{
  "toolId": 4,
  "startDate": "2026-11-10",
  "endDate": "2026-11-15",
  "requiresOperator": true,
  "operatorDailyRate": 80000.00
}
```

---

## 💡 Defensa en el Examen (Argumentos Técnicos)
- **Monetización de Servicios Complementarios:** "Transforma la empresa de un mero rentador pasivo a un prestador de soluciones integrales de ingeniería civil y operación en sitio."
- **Seguridad en el Trabajo (SST):** "Garantiza cumplimiento de las normas de seguridad y salud en el trabajo al exigir operarios con carnet de competencias y afiliación a ARL de alto riesgo."
