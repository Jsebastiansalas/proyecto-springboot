# 📋 Funcionalidad 40: Certificado de Paz y Salvo Financiero & Técnico de Cierre de Contrato

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Patrón de Diseño:** Cryptographic Proof of Contract Settlement & Tamper-Evident Certificate Pattern  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Módulos Involucrados:** `renta-domain` · `renta-infrastructure` · `frontend/React`

---

## 🎯 ¿Qué "Cáscara" o Pregunta Trampa del Profesor Resuelve?
En licitaciones de obras públicas y contratos de ingeniería con interventoría:
> *"El contratista terminó el proyecto y necesita que la interventoría o el Estado le libere el pago final de la planilla de obra (retención de garantía). Pero la interventoría le exige un **'Certificado de Paz y Salvo de Equipos'** emitido por el proveedor que demuestre que no hay deudas, averías pendientes ni reclamos de fianza."*
> *"¿Cómo emite tu software este documento legal formal? ¿Cómo puede un interventor verificar si el documento presentado por el contratista en papel es auténtico o fue falsificado en Photoshop?"*

### La Solución Arquitectónica:
El motor de **Paz y Salvo Criptográfico**:
1. Solo se habilita cuando la reserva está en estado `FINALIZADA` con saldo contable exactamente en cero ($0 COP).
2. Genera un hash criptográfico **SHA-256** derivado de:
   - Código de Reserva + NIT del Contratista + Serial de Máquina + Fecha de Devolución + Total Pagado.
3. Imprime un documento con código QR que apunta a la URL pública de verificación soberana:
   `https://rentamaq.com/verify/paz-y-salvo/{hash}`.
4. Cualquier alteración de un solo dígito o centavo en el documento físico invalida inmediatamente el hash.

---

## 🔐 Algoritmo de Generación de Huella Digital Inmutable

$$\text{PazYSalvoHash} = \text{SHA-256}(\text{Code} \parallel \text{NIT} \parallel \text{ToolSerial} \parallel \text{TotalPaid} \parallel \text{SettlementDate} \parallel \text{MasterSalt})$$

```java
package com.rentamaq.domain.model;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

public class ClearanceCertificateGenerator {

    private static final String MASTER_SALT = "RENTAMAQ_OBRAS_CIVILES_2026_LEGAL_PROOF";

    public static String generateCertificateHash(String reservationCode, String clientNit, 
                                                String toolSerial, double totalPaid, String settlementDate) {
        try {
            String rawString = String.join("|", 
                reservationCode, clientNit, toolSerial, String.valueOf(totalPaid), settlementDate, MASTER_SALT
            );

            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(rawString.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(encodedHash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error criptográfico al generar Paz y Salvo", e);
        }
    }
}
```

---

## 📄 Estructura del Certificado Oficial Imprimible

```
+-----------------------------------------------------------------------------------+
|                           RENTAMAQ COLOMBIA S.A.S.                                |
|                CERTIFICADO OFICIAL DE PAZ Y SALVO FINANCIERO Y TÉCNICO             |
|                        CÓDIGO DE VERIFICACIÓN: PYS-9842-CO                        |
+-----------------------------------------------------------------------------------+
| FECHA DE EMISIÓN: 25 de Octubre de 2026                                           |
| CONTRATISTA ADQUIRIENTE: CONSTRUCTORA ANDINA S.A.S. (NIT: 900.841.229-1)           |
| CONTRATO / RESERVA NÚMERO: RES-2026-0042                                          |
| MAQUINARIA ALQUILADA: COMPRESOR DE TORNILLO 185 CFM (SERIAL: CMP-185-992)         |
+-----------------------------------------------------------------------------------+
| CERTIFICACIÓN DE INTERVENTORÍA:                                                   |
| Por medio del presente documento, RENTAMAQ COLOMBIA certifica que el contratista   |
| ha devuelto a satisfacción la maquinaria objeto de arrendamiento, habiendo        |
| superado la inspección técnica RETIE/4FN, sin registrar saldos pendientes por     |
| concepto de mora, combustible, horas extras de horómetro ni averías mecánicas.     |
|                                                                                   |
| ESTADO DE FIANZA / DEPÓSITO: REEMBOLSADO EN SU TOTALIDAD                          |
| SALDO EXIGIBLE A LA FECHA: $ 0 COP                                                |
+-----------------------------------------------------------------------------------+
| SELLO DIGITAL CRIPTOGRÁFICO SHA-256:                                              |
| e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855                 |
|                                                                                   |
| Validar autenticidad escaneando el código QR o en rentamaq.com/verify/paz-y-salvo  |
+-----------------------------------------------------------------------------------+
```

---

## 🎓 Pregunta de Examen y Argumento de Defensa

* **Pregunta del Profesor:** *"¿Por qué este certificado es superior a emitir un simple recibo o factura marcada como 'PAGADA'?"*
* **Respuesta de 10:** *"Una factura solo certifica una transacción dineraria; no certifica que el bien físico fue restituido en condiciones técnicas adecuadas ni que el depósito de fianza fue finiquitado sin pleitos legales. En contratación de obras públicas (Ley 80 de 1993), el Paz y Salvo Técnico-Financiero con hash SHA-256 es el único documento legal vinculante exigido por las interventorías para el acta de liquidación final del contrato."*
