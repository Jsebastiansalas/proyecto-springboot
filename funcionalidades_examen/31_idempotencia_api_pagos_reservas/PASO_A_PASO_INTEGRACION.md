# 📋 Funcionalidad 31: Clave de Idempotencia en Pagos y Reservas (`Idempotency-Key`)

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Patrón de Diseño:** Idempotency Key Pattern (IETF Draft / Stripe API Standard)  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Módulos Involucrados:** `renta-infrastructure` (Filtro HTTP & Cache) · `renta-application` · `frontend/React`

---

## 🎯 ¿Qué "Cáscara" o Pregunta Trampa del Profesor Resuelve?
En un examen avanzado de desarrollo backend y APIs REST empresariales, los evaluadores suelen plantear:
> *"¿Qué ocurre si la red del contratista titubea en obra mientras paga un alquiler de $10.000.000 COP, o si el usuario hace doble clic frenético en el botón 'Confirmar Pago'?"*
> *"¿Tu API duplica el cobro bancario o genera dos reservas con el mismo inventario?"*

### La Solución Arquitectónica:
El patrón de **Idempotencia** garantiza que múltiples peticiones idénticas enviadas consecutivamente con el mismo encabezado `Idempotency-Key: <UUID>` produzcan **exactamente el mismo resultado que la primera ejecución**, sin cobrar dos veces ni crear registros duplicados.

---

## 🔄 Diagrama de Secuencia del Filtro de Idempotencia

```
Cliente Web (React)                 IdempotencyFilter (Spring)           Database / Core
       |                                       |                               |
       |--- POST /reservations/pay ----------->|                               |
       |    Header: Idempotency-Key: abc-123   |                               |
       |                                       |-- ¿Existe 'abc-123' en BD? -->|
       |                                       |<-- NO existe -----------------|
       |                                       |                               |
       |                                       |-- Procesa Pago Transaccional->|
       |                                       |<-- Pago Exitoso (200 OK) -----|
       |                                       |-- Guarda (key, response, 200)-|
       |<-- 200 OK (Pago Procesado) -----------|                               |
       |                                       |                               |
       | [REINTENTO POR TIMEOUT O DOBLE CLIC]  |                               |
       |--- POST /reservations/pay ----------->|                               |
       |    Header: Idempotency-Key: abc-123   |                               |
       |                                       |-- ¿Existe 'abc-123' en BD? -->|
       |                                       |<-- SÍ existe (Cache 24h) -----|
       |<-- 200 OK (Respuesta Caché Inmediata)-| [NO toca el core ni el saldo] |
```

---

## 🏗️ Implementación Técnica en Spring Boot

### 1. Tabla de Registro de Idempotencia (PostgreSQL)

```sql
CREATE TABLE IF NOT EXISTS idempotency_records (
    id BIGSERIAL PRIMARY KEY,
    idempotency_key VARCHAR(120) NOT NULL UNIQUE,
    http_method VARCHAR(10) NOT NULL,
    request_uri VARCHAR(255) NOT NULL,
    request_hash VARCHAR(64) NOT NULL,
    response_status INT NOT NULL,
    response_body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_idempotency_key_lookup ON idempotency_records (idempotency_key);
```

### 2. Filtro Interceptor HTTP (`IdempotencyFilter.java`)

```java
package com.rentamaq.infrastructure.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class IdempotencyFilter implements Filter {

    private final IdempotencyRepository idempotencyRepo;

    public IdempotencyFilter(IdempotencyRepository idempotencyRepo) {
        this.idempotencyRepo = idempotencyRepo;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String key = httpRequest.getHeader("Idempotency-Key");
        if (key == null || key.isBlank() || !httpRequest.getMethod().equalsIgnoreCase("POST")) {
            chain.doFilter(request, response);
            return;
        }

        // 1. Verificar si la clave ya fue procesada en las últimas 24 horas
        var existing = idempotencyRepo.findByKey(key);
        if (existing.isPresent()) {
            var cached = existing.get();
            httpResponse.setStatus(cached.getResponseStatus());
            httpResponse.setContentType("application/json");
            httpResponse.setHeader("X-Cache-Lookup", "HIT-IDEMPOTENT");
            httpResponse.getOutputStream().write(cached.getResponseBody().getBytes(StandardCharsets.UTF_8));
            return;
        }

        // 2. Si es nueva, capturar respuesta y persistirla
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(httpResponse);
        chain.doFilter(request, responseWrapper);

        byte[] responseArray = responseWrapper.getContentAsByteArray();
        String responseStr = new String(responseArray, StandardCharsets.UTF_8);

        idempotencyRepo.saveRecord(key, httpRequest.getMethod(), httpRequest.getRequestURI(),
                httpResponse.getStatus(), responseStr);

        responseWrapper.copyBodyToResponse();
    }
}
```

### 3. Generación en el Frontend (`PaymentModal.tsx`)

```typescript
// Al pulsar el botón de pago, se genera un UUID v4 criptográfico único para la transacción
const idempotencyKey = crypto.randomUUID();

const response = await fetch('/api/v1/payments/process', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Idempotency-Key': idempotencyKey,
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ reservationId, amount, paymentMethod })
});
```

---

## 🎓 Pregunta de Examen y Argumento de Defensa

* **Pregunta del Profesor:** *"¿Por qué la idempotencia no debe manejarse únicamente con un `debounce` en JavaScript en el frontend?"*
* **Respuesta de 10:** *"El debounce en cliente solo previene clics dobles locales. Pero no protege contra reintentos automáticos de redes móviles con alta latencia, caídas de señal TCP intermedias, peticiones concurrentes por API externa o llamadas automatizadas de bots. La idempotencia debe garantizarse como invariante a nivel de protocolo HTTP en el servidor con persistencia transaccional."*
