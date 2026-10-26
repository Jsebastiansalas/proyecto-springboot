# 📋 Funcionalidad 17: Liquidación Tributaria DIAN & Retenciones Fiscales (Facturación Legal B2B)

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Normativa Legal:** Estatuto Tributario de Colombia (Arts. 392, 437-2, 468) & Sistema de Facturación Electrónica DIAN  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Módulos Involucrados:** `renta-infrastructure` · `frontend/React`

---

## 🎯 ¿Qué problema de negocio resuelve?
En Colombia y América Latina, el alquiler de equipos comerciales y maquinaria pesada entre personas jurídicas (B2B) está sujeto a un estricto régimen de **retenciones tributarias en la fuente**.

Si un sistema de alquiler solo cobra `Subtotal + IVA`:
1. **Inconsistencia Contable:** El cliente corporativo retiene impuestos por ley y no pagará el 100% del valor facturado; el software mostrará facturas en mora permanente por descuadres de retenciones.
2. **Sanciones Tributarias DIAN:** Incumplimiento en la discriminación de la base gravable, el IVA generado y las retenciones asumidas.
3. **Falta de Claridad para el Proveedor:** El dueño de la maquinaria no sabe cuánto dinero neto recibirá realmente en su cuenta bancaria tras las deducciones de ley.

---

## ⚖️ Marco Tributario y Fórmulas de Liquidación

Para un alquiler con Base Gravable $\text{Subtotal} = \$ 100.000\text{ COP}$:

| Concepto Fiscal | Fundamento Legal | Tarifa | Cálculo | Efecto en Total |
| :--- | :--- | :---: | :---: | :---: |
| **Base Gravable** | Alquiler de Equipo Mueble | — | $\$ 100.000$ | Base |
| **IVA Generado** | Art. 468 del Estatuto Tributario | **19.0%** | $+ \$ 19.000$ | **Suma** al cobro |
| **Retención en la Fuente** | Art. 392 E.T. (Arrendamiento muebles) | **4.0%** | $- \$ 4.000$ | **Resta** (retenido) |
| **Retención de IVA (ReteIVA)** | Art. 437-2 E.T. (15% del IVA facturado) | **15.0%** | $- \$ 2.850$ | **Resta** (retenido) |
| **Retención de ICA (ReteICA)** | Acuerdo Distrital / Ley 14 de 1983 | **0.966%** | $- \$ 966$ | **Resta** (retenido) |
| **Total Retenciones Deducidas** | Sumatoria de retenciones de ley | — | **$- \$ 7.816$** | Retención total |
| **Neto Facturado por Alquiler** | $\text{Subtotal} + \text{IVA} - \text{Retenciones}$ | — | **$\$ 111.184$** | Ingreso neto patio |
| **Fianza Escrow Reembolsable** | Custodia de garantía (sin impuestos) | Variable | $+\$ 100.000$ | Fianza amparada |

---

## 🏗️ Ubicación de los Componentes en el Proyecto

### 1. Módulo Infraestructura (`renta-infrastructure`)
- **Controlador REST:** [InvoiceController.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/adapter/in/rest/InvoiceController.java)
  - `GET /api/v1/invoices/reservation/{reservationId}`: Datos fiscales de la factura vinculada al contrato.
  - `GET /api/v1/invoices/{id}/pdf`: Descarga del comprobante oficial con código fiscal.

---

## 🖥️ Componentes de la Interfaz de Usuario (React 18)

1. **Modal de Liquidación Tributaria ([DianTaxSettlementModal.tsx](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/frontend/src/components/common/DianTaxSettlementModal.tsx)):**
   - Accesible mediante el botón **"Retenciones DIAN"** en [`ClientPortal.tsx`](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/frontend/src/components/client/ClientPortal.tsx) y en la pestaña de facturación de [`ProviderPortal.tsx`](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/frontend/src/components/provider/ProviderPortal.tsx).
   - **Encabezado Institucional:** NIT 901.884.231-9, Resolución DIAN No. 18764000001 de 2026 y código CIIU 7730.
   - **Tabla Discriminada:** Desglose paso a paso de Subtotal, IVA 19%, Retefuente 4%, ReteIVA 15%, ReteICA y Fianza Escrow neta.
   - **Integración con Trust Score:** Aplica automáticamente el 50% de descuento en fianza para contratistas Platinum.
   - **Sello CUFE:** Código Único de Factura Electrónica emitido con hash SHA-256.
   - **Impresión Directa:** Botón para imprimir la liquidación tributaria oficial en papel membretado listo para auditorías.

2. **Libro Fiscal en Patio Proveedores ([ProviderPortal.tsx](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/frontend/src/components/provider/ProviderPortal.tsx)):**
   - Pestaña **"Facturación & Liquidaciones"**:
     * **4 Tarjetas KPI en Tiempo Real:** Recaudo Neto Patio, Facturación Base, IVA Recaudado y Retenciones Deducidas.
     * **Tabla del Libro Fiscal:** Lista todos los contratos con código de Factura Electrónica (`FE-2026-XXXXXX`), cliente, bases, impuestos, retenciones y botones de acción.

---

## 💡 Defensa en el Examen (Argumentos Técnicos)
- **Realismo Contable y B2B:** Demuestra madurez en la comprensión de los flujos de tesorería empresarial en Colombia, incorporando retención en la fuente y ReteIVA exigidos por la DIAN.
- **Transparencia en Conciliación Bancaria:** Proveedor y contratista tienen acceso al mismo soporte numérico y resolución DIAN, eliminando disputas por cobros o deducciones.
