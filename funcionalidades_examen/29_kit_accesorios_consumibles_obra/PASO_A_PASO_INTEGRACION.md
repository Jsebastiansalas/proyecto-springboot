# 📋 Funcionalidad 29: Gestión de Kits de Accesorios y Consumibles de Obra

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Estrategia Comercial:** Cross-Selling of Accessories and Consumables  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Módulos Involucrados:** `renta-domain` · `renta-application` · `frontend/React`

---

## 🎯 ¿Qué problema de negocio resuelve?
Al alquilar un rotomartillo demoledor, una cortadora de pavimento o un compresor de aire, la máquina principal no funciona de forma aislada:
1. **Falta de Insumos Críticos en Obra:** El contratista recibe el rotomartillo pero no tiene la broca SDS Max de 1 pulgada o el cincel de punta, perdiendo horas valiosas buscando ferreterías cercanas.
2. **Diferenciación entre Alquiler y Venta:**
   - **Accesorios Retornables:** Extensiones eléctricas industriales de 30m, mangueras de aire de alta presión (se alquilan y se devuelven).
   - **Consumibles de Desgaste:** Discos de corte diamantados, brocas, lubricantes (se venden de forma definitiva sin fianza).
3. **Facturación Unificada:** Permite incluir ambos conceptos en la misma cotización y factura electrónica DIAN bajo códigos contables diferenciados.

---

## 📦 Matriz de Accesorios y Consumibles por Tipo de Máquina

| Maquinaria Principal | Accesorio Retornable (Alquiler) | Consumible de Venta (Definitivo) |
| :--- | :--- | :--- |
| **Rotomartillo SDS Max** | Extensión Eléctrica Uso Rudo 30m ($\$ 10.000\text{ COP/día}$) | Juego de Cinceles de Impacto ($\$ 45.000\text{ COP}$) |
| **Compresor 50L** | Manguera Espiral Neumática 15m ($\$ 12.000\text{ COP/día}$) | Filtro de Aire y Aceite de Repuesto ($\$ 30.000\text{ COP}$) |
| **Cortadora de Piso** | Bomba de Agua Sumergible ($\$ 25.000\text{ COP/día}$) | Disco Diamantado 14" Concreto Curado ($\$ 180.000\text{ COP}$) |

---

## 🏗️ Ubicación de los Componentes en el Proyecto

### 1. Módulo Dominio (`renta-domain`)
- **Entidad:** `ToolSpecification.java` y líneas de cotización detalladas en [Reservation.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-domain/src/main/java/com/renta/domain/model/entity/Reservation.java).

### 2. Frontend React 18
- **Selector de Accesorios en Ficha Técnica ([ToolDetailModal.tsx](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/frontend/src/components/catalog/ToolDetailModal.tsx)):**
  - Checkboxes interactivos para añadir kits complementarios antes de agregar al carrito.

---

## 🔌 Endpoints REST

- **POST** `/api/v1/reservations/calculate-price`
- **Request con Kit de Consumibles:**
```json
{
  "toolId": 1,
  "startDate": "2026-11-10",
  "endDate": "2026-11-13",
  "selectedAccessories": [
    { "name": "Extensión Uso Rudo 30m", "dailyPrice": 10000.00, "isConsumable": false },
    { "name": "Punta Cincel SDS Max", "purchasePrice": 45000.00, "isConsumable": true }
  ]
}
```

---

## 💡 Defensa en el Examen (Argumentos Técnicos)
- **Incremento del Ticket Promedio (AOV):** "Aumenta la facturación media por contrato un 25% ofreciendo la solución integral que el maestro de obra necesita para empezar a trabajar de inmediato."
- **Claridad Impositiva:** "Discrimina fiscalmente el arrendamiento de bienes muebles (sujeto a retención del 4%) frente a la enajenación de consumibles (venta de bienes muebles al 2.5%)."
