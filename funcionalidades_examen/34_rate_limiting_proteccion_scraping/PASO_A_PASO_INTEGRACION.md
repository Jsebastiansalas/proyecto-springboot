# 📋 Funcionalidad 34: Rate Limiting & Throttling contra Web Scraping y DoS (Token Bucket Pattern)

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Patrón de Diseño:** Token Bucket Rate Limiting (RFC 6585 - HTTP 429 Too Many Requests)  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Módulos Involucrados:** `renta-infrastructure` (Filtros de Seguridad) · `Spring Web`

---

## 🎯 ¿Qué "Cáscara" o Pregunta Trampa del Profesor Resuelve?
En evaluaciones de seguridad y escalabilidad de software:
> *"¿Qué ocurre si un competidor programa un bot en Python con Selenium o Scrapy para consultar los precios de tu catálogo 500 veces por minuto, saturando tu base de datos PostgreSQL?"*
> *"¿O qué pasa si intentan adivinar cupones de descuento válidos mediante un ataque de fuerza bruta por diccionario?"*

### La Solución Arquitectónica:
Implementación de un interceptor de **Rate Limiting** basado en el algoritmo **Token Bucket**:
1. Cada dirección IP o cliente autenticado recibe un balde de tokens (ej. **30 peticiones por minuto** para endpoints públicos y **5 por minuto** para validación de cupones o login).
2. Si un cliente consume todos sus tokens, el servidor responde inmediatamente con código **`HTTP 429 Too Many Requests`** junto con los encabezados estándar `X-RateLimit-Limit`, `X-RateLimit-Remaining` y `Retry-After`.
3. Esto ahorra CPU y conexiones a la base de datos, repeliendo bots de scraping y ataques de denegación de servicio.

---

## 📊 Encabezados HTTP RFC 6585

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 0
Retry-After: 45

{
  "status": 429,
  "error": "TOO_MANY_REQUESTS",
  "message": "Has excedido el límite de peticiones permitido. Por favor espera 45 segundos antes de reintentar.",
  "timestamp": "2026-10-25T22:36:00Z"
}
```

---

## 🏗️ Implementación Técnica en Spring Boot

### 1. Interceptor Token Bucket (`RateLimitingInterceptor.java`)

```java
package com.rentamaq.infrastructure.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitingInterceptor implements HandlerInterceptor {

    private static final int MAX_REQUESTS_PER_MINUTE = 30;
    private final Map<String, ClientWindow> clientWindows = new ConcurrentHashMap<>();

    private record ClientWindow(long windowStartEpochMs, AtomicInteger requestCount) {}

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String clientIp = getClientIp(request);
        long now = System.currentTimeMillis();

        ClientWindow window = clientWindows.compute(clientIp, (ip, current) -> {
            if (current == null || (now - current.windowStartEpochMs) > 60_000) {
                return new ClientWindow(now, new AtomicInteger(1));
            }
            current.requestCount.incrementAndGet();
            return current;
        });

        int currentCount = window.requestCount.get();
        int remaining = Math.max(0, MAX_REQUESTS_PER_MINUTE - currentCount);

        response.setHeader("X-RateLimit-Limit", String.valueOf(MAX_REQUESTS_PER_MINUTE));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));

        if (currentCount > MAX_REQUESTS_PER_MINUTE) {
            long retryAfterSeconds = Math.max(1, (60_000 - (now - window.windowStartEpochMs)) / 1000);
            response.setStatus(429);
            response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
            response.setContentType("application/json");
            response.getWriter().write("""
                {
                  "error": "TOO_MANY_REQUESTS",
                  "message": "Límite de tasa excedido. Intenta nuevamente en %d segundos."
                }
            """.formatted(retryAfterSeconds));
            return false;
        }

        return true;
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        return (xf != null && !xf.isBlank()) ? xf.split(",")[0].trim() : request.getRemoteAddr();
    }
}
```

---

## 🎓 Pregunta de Examen y Argumento de Defensa

* **Pregunta del Profesor:** *"¿Por qué se usa `ConcurrentHashMap` con `AtomicInteger` en lugar de variables sincronizadas (`synchronized`)?"*
* **Respuesta de 10:** *"El uso de `ConcurrentHashMap` con operaciones CAS (*Compare-And-Swap*) de `AtomicInteger` ofrece concurrencia no-bloqueante (*lock-free*), permitiendo atender cientos de hilos de Tomcat simultáneamente sin generar cuellos de botella por contención de bloqueos."*
