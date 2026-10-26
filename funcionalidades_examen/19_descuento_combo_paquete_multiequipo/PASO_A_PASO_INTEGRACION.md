# 📋 Funcionalidad 19: Descuento Paquete Multi-Equipo (Combo 10% en Maquinaria)

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Estrategia Comercial:** Bundle Pricing & Cross-Selling para Cuadrillas de Obra  
> **Compilación y Pruebas:** `npm run build` y Vite exitoso (0 errores).  
> **Módulos Involucrados:** `frontend/React` · Cotizador Industrial

---

## 🎯 ¿Qué problema de negocio resuelve?
En el sector de la construcción, las cuadrillas rara vez requieren una sola herramienta aislada; generalmente arriendan paquetes complementarios (ej. *Rotomartillo + Compresor de Aire*, o *Mezcladora + Vibrador de Concreto*).

Si la plataforma cobra la tarifa plana individual para cada equipo:
1. Las constructoras cotizan equipos por separado en distintos proveedores buscando mejores precios.
2. Disminuye el ticket promedio por cliente y el volumen de despacho eficiente por flete de transporte.

---

## 🏷️ Regla de Negocio Implementada

$$\text{Si el número de herramientas en cotización es } \ge 2:$$
$$\text{Herramienta Principal (índice 0)} \rightarrow \text{Tarifa diaria regular 100\%}$$
$$\text{Herramientas Complementarias (índice } \ge 1) \rightarrow \mathbf{10\%\text{ de Descuento en tarifa diaria}}$$

### Ejemplo de Liquidación:
- **Herramienta 1 (Rotomartillo):** $\$ 45.000\text{ COP/día}$ (Tarifa regular).
- **Herramienta 2 (Compresor 50L):** $\$ 65.000\text{ COP/día} \rightarrow \mathbf{-10\% = -\$ 6.500\text{ COP/día}}$.
- **Ahorro total por 3 días:** $\$ 19.500\text{ COP}$ de descuento directo aplicado en la cotización.

---

## 🏗️ Implementación en el Frontend React 18

En el componente [QuoteCartDrawer.tsx](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/frontend/src/components/quote/QuoteCartDrawer.tsx):

```typescript
// Detección automática del paquete multi-equipo
const isComboEligible = cartItems.length >= 2;

// Cálculo del 10% sobre las herramientas secundarias
const totalDescuentoCombo = isComboEligible
  ? cartItems.slice(1).reduce((sum, item) => {
      const dailyPrice = Number(item.tool.baseDailyPrice || 50000);
      const days = item.days || 1;
      return sum + (dailyPrice * days * 0.10);
    }, 0)
  : 0;

const subtotalConDescuento = subtotalOriginal - totalDescuentoCombo;
```

---

## 🖥️ Experiencia de Usuario (UI Industrial)

1. **Badge Promocional Dinámico:**
   - Cuando el usuario añade la segunda herramienta al carrito, se activa un badge de color ámbar en la cabecera:
     > *"🎉 Descuento Combo 10% Aplicado en Equipos Complementarios"*
2. **Desglose en el Resumen Financiero:**
   - Subtotal Maquinaria regular.
   - Fila de descuento en verde esmeralda: `Descuento Paquete Multi-Equipo: -$ XX.XXX COP`.
   - Depósito en Garantía Escrow.
   - Gran Total transparente y validado antes de enviar la cotización.

---

## 💡 Defensa en el Examen (Argumentos Técnicos)
- **Optimización Logística y Ventas:** Despachar varias máquinas en un mismo viaje optimiza los costos de flete y bodega, justificando comercialmente el descuento y aumentando la rentabilidad global.
- **Cálculo Reactivo en Tiempo Real:** El estado de React calcula y refleja el descuento al instante cada vez que el usuario modifica días o ítems en el carrito, sin necesidad de llamadas de red innecesarias.
