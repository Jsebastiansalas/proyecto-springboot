# 📋 Funcionalidad 26: Firma Electrónica, Pagaré Desmaterializado y Contrato Marco de Arrendamiento

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Marco Legal:** Ley 527 de 1999 (Comercio Electrónico y Firmas Digitales en Colombia) & Código de Comercio Art. 622  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Módulos Involucrados:** `renta-domain` · `renta-infrastructure` · `frontend/React`

---

## 🎯 ¿Qué problema de negocio resuelve?
Al alquilar maquinaria que cuesta entre $15.000.000 y $120.000.000 COP (retroexcavadoras, generadores trifásicos, compresores de tornillo), el proveedor no puede despachar los equipos amparado únicamente en un "clic" informal:
1. **Riesgo Jurídico de Pérdida o Apropiación Indebida:** Si el contratista no devuelve la máquina o la traslada sin autorización a otra ciudad, las aseguradoras y juzgados exigen un **Contrato de Arrendamiento Mercantil y un Pagaré en Blanco con Carta de Instrucciones** debidamente firmado.
2. **Validez Probatoria y No-Repudio:** La firma electrónica debe almacenar la IP de conexión, el timestamp exacto, el documento de identidad del representante legal y el hash criptográfico SHA-256 del texto del contrato.
3. **Flujo Cero Papel (Paperless):** El contratista puede firmar desde su celular o computador en obra antes de que el camión salga del patio.

---

## 📜 Estructura del Pagaré y Contrato Digital

Cada contrato genera un expediente probatorio que contiene:
1. **Cláusula de Destinación Exclusiva:** Dirección del frente de obra autorizada.
2. **Pagaré Mercantil con Espacios en Blanco:** Respaldado por el Código de Comercio colombiano para cobro coactivo de averías no cubiertas por la fianza.
3. **Evidencia Digital de Consentimiento:**
   - IP Pública del Cliente.
   - User-Agent del dispositivo firmante.
   - Firma en trazado vectorial o validación biométrica/OTP.
   - Huella digital SHA-256 inmutable del documento.

---

## 🏗️ Ubicación de los Componentes en el Proyecto

### 1. Módulo Dominio (`renta-domain`)
- **Entidad:** [Reservation.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-domain/src/main/java/com/renta/domain/model/entity/Reservation.java) con campo de firma digital y timestamp de aceptación.

### 2. Frontend React 18
- **Comprobante de Contrato y Pagaré:** Integrado en el flujo de confirmación de reserva y visualización en el portal del cliente con botón de descarga oficial.

---

## 🔌 Endpoints REST

- **PATCH** `/api/v1/reservations/{id}/sign-contract`
- **Request Payload:**
```json
{
  "signerFullName": "Carlos Gómez Saldarriaga",
  "signerDocumentNumber": "1000007919",
  "signerRole": "Representante Legal Consorcio Obra Metro",
  "clientIp": "190.144.12.85",
  "signatureHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "acceptPromissoryNote": true
}
```
- **Respuesta (`200 OK`):**
```json
{
  "reservationCode": "RES-2026-0042",
  "contractStatus": "FIRMADO_LEGALMENTE",
  "signedAt": "2026-10-25T21:10:00Z",
  "cufeContractCode": "CTR-2026-90708-B2B",
  "message": "Contrato marco y pagaré mercantil perfeccionados con plena validez legal."
}
```

---

## 💡 Defensa en el Examen (Argumentos Técnicos)
- **Blindaje Jurídico Corporativo:** "Eleva el software al estándar de empresas multinacionales de alquiler como Loxam o Hilti, donde ningún equipo es liberado sin la formalización de un título valor ejecutable en vía judicial."
- **Cumplimiento Normativo Ley 527:** "El almacenamiento de la firma electrónica, metadata de IP y sellos de tiempo satisface plenamente los requisitos de integridad y autenticidad del Código General del Proceso."
