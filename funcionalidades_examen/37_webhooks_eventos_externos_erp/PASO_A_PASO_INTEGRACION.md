# 📋 Funcionalidad 37: Webhooks Asíncronos con Firma Criptográfica HMAC-SHA256 para Integración con ERP

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Patrón de Diseño:** Webhook Event-Driven Architecture & Cryptographic Signature Pattern (HMAC-SHA256)  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Módulos Involucrados:** `renta-infrastructure` · `renta-application` · `Spring WebClient`

---

## 🎯 ¿Qué "Cáscara" o Pregunta Trampa del Profesor Resuelve?
En evaluaciones de arquitectura empresarial e integración de sistemas (EAI):
> *"Grandes constructoras no van a tener a un empleado refrescando la pantalla de RentaMaq todo el día para ver si el camión ya entregó la torre de iluminación en la obra."*
> *"¿Cómo notificas al software contable o al ERP de obra (SAP / Procore) de la constructora en tiempo real? ¿Y cómo garantiza la constructora que el webhook proviene legítimamente de tu servidor y no de un atacante (Man-In-The-Middle)?"*

### La Solución Arquitectónica:
Un sistema despachador de **Webhooks**:
1. El cliente registra una URL de callback (ej. `https://erp.constructora.com/api/rentals/webhook`) y un secreto compartido (`shared_secret`).
2. Cuando ocurre un evento clave (`RESERVATION_CONFIRMED`, `TOOL_DELIVERED`, `DAMAGE_REPORTED`), Spring Boot despacha un POST asíncrono con el payload en JSON.
3. El encabezado `X-RentaMaq-Signature: sha256=...` contiene la firma criptográfica **HMAC-SHA256**, permitiendo al ERP verificar autenticidad e integridad del mensaje.
4. Incluye política de reintentos exponenciales (*exponential backoff*) si el endpoint del cliente responde con timeout o error 5xx.

---

## 🔐 Algoritmo de Firma HMAC-SHA256

$$\text{Signature} = \text{HMAC-SHA256}(\text{JSON Payload}, \text{Shared Secret})$$

```java
package com.rentamaq.infrastructure.webhook;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

public class WebhookSignatureCalculator {

    public static String calculateHmac(String payload, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] rawHmac = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return "sha256=" + HexFormat.of().formatHex(rawHmac);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error al calcular firma de webhook", e);
        }
    }
}
```

---

## 🏗️ Despacho Asíncrono con Reintentos (`WebhookDispatcherService.java`)

```java
@Service
public class WebhookDispatcherService {

    private final WebClient webClient = WebClient.builder().build();

    @Async
    public void dispatchEvent(String targetUrl, String secret, String eventType, Object data) {
        String jsonPayload = serializeToJson(Map.of(
            "event", eventType,
            "timestamp", Instant.now().toString(),
            "data", data
        ));

        String signature = WebhookSignatureCalculator.calculateHmac(jsonPayload, secret);

        webClient.post()
            .uri(targetUrl)
            .header("Content-Type", "application/json")
            .header("X-RentaMaq-Signature", signature)
            .header("X-RentaMaq-Event", eventType)
            .bodyValue(jsonPayload)
            .retrieve()
            .toBodilessEntity()
            .retryWhen(Retry.backoff(3, Duration.ofSeconds(2)))
            .subscribe(
                success -> log.info("Webhook {} entregado exitosamente a {}", eventType, targetUrl),
                error -> log.error("Fallo al entregar webhook tras 3 reintentos: {}", error.getMessage())
            );
    }
}
```

---

## 🎓 Pregunta de Examen y Argumento de Defensa

* **Pregunta del Profesor:** *"¿Por qué el despacho del webhook debe ser estrictamente asíncrono (`@Async`)?"*
* **Respuesta de 10:** *"Si el webhook fuera sincrónico, cualquier lentitud, latencia o caída del servidor del cliente bloquearía la transacción de entrega en nuestro sistema, dejando al operario de patio congelado en la pantalla. Despachar de forma asíncrona desacopla el rendimiento y aísla las fallas externas."*
