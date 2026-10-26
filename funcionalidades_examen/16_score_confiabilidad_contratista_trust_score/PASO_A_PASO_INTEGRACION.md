# 📋 Funcionalidad 16: Motor de Calificación y Score de Confiabilidad del Contratista (Client Trust Score)

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Patrón de Diseño:** Strategy Pattern / Score Calculation Engine  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Módulos Involucrados:** `renta-application` · `renta-infrastructure` · `frontend/React`

---

## 🎯 ¿Qué problema de negocio resuelve?
En el negocio de renta de maquinaria, exigir un depósito en garantía (fianza) muy alto protege al proveedor, pero **desincentiva la contratación de constructoras serias y recurrentes**. Por otro lado, eliminar o rebajar la fianza a clientes nuevos expone a la empresa a pérdidas por robo, desmantelamiento o averías no canceladas.

La solución empresarial estándar es un **Motor de Calificación Algorítmica (Trust Score Engine)** que evalúa el historial operativo del cliente y ajusta dinámicamente el valor de la fianza requerida.

---

## 🧮 El Algoritmo de Calificación (0 a 100 Puntos)

El servicio evalúa en tiempo real tres variables fundamentales:
1. **Puntualidad en Devoluciones:** Retornos en la fecha pactada sin días en mora.
2. **Historial de Siniestros e Incidentes:** Entregas con o sin reportes de daño técnico.
3. **Volumen de Contratos Finalizados con Éxito:** Trayectoria demostrable dentro de la plataforma.

### Fórmula Algorítmica:
$$\text{Base} = 100$$
$$\text{Penalización por Mora} = \text{devolucionesTardias} \times 15\text{ pts}$$
$$\text{Penalización por Daños} = \text{incidentesDano} \times 20\text{ pts}$$
$$\text{Score Final} = \max(10, \min(100, \text{Base} - \text{Penalización por Mora} - \text{Penalización por Daños}))$$

---

## 🎖️ Matriz de Niveles (Tiers) y Beneficios Financieros

| Nivel (Tier) | Rango de Score | Color Badge | Descuento en Fianza (Escrow) | Política de Aprobación |
| :--- | :---: | :---: | :---: | :--- |
| **`EXCELENTE`** | 90 – 100 pts | Esmeralda | **-50% de Fianza** | Despacho Express sin validaciones previas |
| **`CONFIABLE`** | 75 – 89 pts | Azul | **-25% de Fianza** | Aprobación estándar prioritaria |
| **`RIESGO_MODERADO`**| 60 – 74 pts | Ámbar | **0% (Fianza 100%)** | Requiere póliza contractual estándar |
| **`ALTO_RIESGO`** | < 60 pts | Rojo | **+20% de Recargo** | Depósito ampliado y validación de antecedentes |

---

## 🏗️ Ubicación de los Componentes en el Proyecto

### 1. Módulo Aplicación (`renta-application`)
- **DTO Response:** [ClientTrustScoreResponse.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-application/src/main/java/com/renta/application/dto/client/ClientTrustScoreResponse.java)
- **Lógica de Cálculo:** Encapsulada en el servicio de evaluación de riesgo crediticio y operativo del contratista.

### 2. Módulo Infraestructura (`renta-infrastructure`)
- **Controlador REST:** [ClientTrustScoreController.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/adapter/in/rest/ClientTrustScoreController.java)
  - Endpoint por ID: `GET /api/v1/clients/{id}/trust-score`
  - Endpoint para usuario autenticado: `GET /api/v1/clients/my/trust-score`

---

## 🔌 Endpoints REST

### 1. Consultar Trust Score del Contratista
- **GET** `/api/v1/clients/{id}/trust-score`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Respuesta Exitosa (`200 OK`):**
```json
{
  "clientId": 1,
  "clientName": "Carlos Gómez",
  "companyName": "Carlos Gómez Construcciones",
  "documentNumber": "1000007919",
  "score": 100,
  "tier": "EXCELENTE",
  "tierBadgeColor": "emerald",
  "totalContracts": 26,
  "completedContracts": 18,
  "activeContracts": 7,
  "lateReturns": 0,
  "damageIncidents": 0,
  "punctualityRate": 100.0,
  "depositDiscountPercent": 50,
  "benefitsDescription": "Exención del 50% en fianza de garantía, despacho express y línea de crédito preferencial.",
  "recommendation": "Contratista Platinum. Aprobación inmediata sin validaciones adicionales.",
  "evaluatedAt": "2026-10-25T21:22:23.106991900Z"
}
```

---

## 🖥️ Componentes de la Interfaz de Usuario (React 18)

1. **Banner de Confiabilidad en Portal Cliente ([ClientPortal.tsx](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/frontend/src/components/client/ClientPortal.tsx)):**
   - Encabezado con medalla de nivel: *"Score: 100/100 · Nivel EXCELENTE (Platinum)"*.
   - Muestra las métricas operativas: Tasa de puntualidad (100%), contratos sin siniestro y el beneficio activo: **50% de descuento en fianza**.
2. **Aplicación Automática en Liquidación DIAN ([DianTaxSettlementModal.tsx](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/frontend/src/components/common/DianTaxSettlementModal.tsx)):**
   - En la fila 6 del resumen fiscal de la reserva: *"Beneficio Trust Score: -50% fianza aplicada"*, liquidando automáticamente solo la mitad del depósito requerido.

---

## 💡 Defensa en el Examen (Argumentos Técnicos)
- **Fintech & Scoring Crediticio:** Aplica principios modernos de evaluación crediticia algorítmica al modelo de alquiler industrial, reduciendo barreras de entrada para contratistas calificados.
- **Acoplamiento Débil:** El cálculo del score no bloquea las transacciones principales; se calcula bajo demanda y se cachea para optimizar rendimiento de lectura.
