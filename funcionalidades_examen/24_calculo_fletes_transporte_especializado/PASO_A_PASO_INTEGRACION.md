# 📋 Funcionalidad 24: Cotizador y Selector Logístico de Fletes de Transporte Especializado

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Patrón de Diseño:** Strategy Pattern for Logistics Fulfillment  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Módulos Involucrados:** `renta-domain` · `renta-application` · `frontend/React`

---

## 🎯 ¿Qué problema de negocio resuelve?
A diferencia del comercio electrónico convencional, la maquinaria industrial (compresores de 250 kg, torres de iluminación, plantas eléctricas) no puede enviarse por correo estándar ni transportarse en un automóvil particular:
1. **Fletes Ciegos o No Presupuestados:** Si el sistema no desglosa el costo de transporte, el cliente asume que el alquiler incluye el envío, generando fricción y rechazos en la entrega.
2. **Requerimientos Especiales de Carga:** Ciertos equipos exigen camión con brazo articulado (grúa pluma) o camión de plataforma plana cama-baja con rampas hidráulicas.
3. **Opción de Autogestión:** Los contratistas que disponen de flota propia deben tener la opción de retirar el equipo directamente en patio sin pagar sobrecostos logísticos.

---

## 🚚 Matriz de Métodos de Entrega y Tarifas Logísticas

| Método de Despacho | Vehículo / Modalidad | Capacidad / Aplicación | Tarifa Logística Fija |
| :--- | :--- | :--- | :---: |
| **`PICKUP_PATIO`** | Retiro Personal por Contratista | Herramientas manuales o transporte propio | **$0 COP** |
| **`FURGON_URBANO`** | Camioneta / Furgón de Reparto | Equipos livianos (< 100 kg) en perímetro urbano | **$45.000 COP** |
| **`CAMION_GRUA`** | Camión con Brazo Hidráulico Pluma | Equipos medianos (100 a 500 kg) que requieren izaje | **$120.000 COP** |
| **`CAMA_BAJA`** | Tractocamión Plataforma Cama-Baja | Maquinaria pesada (> 500 kg), rodillos, orugas | **$250.000 COP** |

---

## 🏗️ Ubicación de los Componentes en el Proyecto

### 1. Módulo Dominio (`renta-domain`)
- **Enum de Logística:** `ShippingMethod` (`PICKUP_PATIO`, `FURGON_URBANO`, `CAMION_GRUA`, `CAMA_BAJA`)
- **Calculador de Flete:** Integrado en el Value Object de liquidación contractual.

### 2. Frontend React 18
- **Selector de Logística en Cotizador ([QuoteCartDrawer.tsx](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/frontend/src/components/quote/QuoteCartDrawer.tsx)):**
  - Radio buttons para elegir el método de entrega en obra.
  - Suma dinámicamente el flete logístico al subtotal antes del IVA.

---

## 🔌 Endpoints REST

- **POST** `/api/v1/reservations/calculate-price`
- **Request con Flete:**
```json
{
  "toolId": 5,
  "startDate": "2026-11-05",
  "endDate": "2026-11-08",
  "shippingMethod": "CAMION_GRUA",
  "hasDamageInsurance": true
}
```
- **Respuesta (`200 OK`):**
```json
{
  "totalDays": 3,
  "basePrice": 360000.00,
  "shippingFee": 120000.00,
  "insuranceFee": 36000.00,
  "subtotal": 516000.00,
  "taxIva": 98040.00,
  "totalPrice": 614040.00
}
```

---

## 🖥️ Interfaz de Usuario (React 18)

1. **Selector de Fletes en Carrito de Cotización:**
   - Permite al usuario marcar *"Entrega en Frente de Obra"* o *"Retiro en Patio Proveedor"*.
   - Muestra el desglose del camión asignado según el tonelaje de los equipos seleccionados.
2. **Desglose en la Factura DIAN y Acta de Despacho:**
   - El flete aparece como ítem gravado independiente con su respectivo IVA del 19%.

---

## 💡 Defensa en el Examen (Argumentos Técnicos)
- **Realismo Operativo:** "Demuestra comprensión profunda de la cadena de suministro industrial, donde el flete de transporte representa hasta el 25% del costo operativo de un alquiler de maquinaria pesada."
- **Transparencia en Facturación:** "Evita disputas legales detallando la responsabilidad del transporte y el estado de entrega en la orden de despacho."
