# 📋 Funcionalidad 21: Sistema de Reseñas, Calificación 1 a 5 Estrellas y Testimonios de Obra Verificados

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Patrón de Diseño:** Feedback Loop & Verified Purchase Integrity Pattern  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Base de Datos:** Tabla `reviews` con restricción única `UNIQUE(reservation_id)` y check `CHECK(rating >= 1 AND rating <= 5)`.

---

## 🎯 ¿Qué problema de negocio resuelve?
En plataformas de alquiler B2B y construcción pesada, la reputación y el estado real de los equipos son críticos para la toma de decisiones:
1. **Prevención de Reseñas Falsas o Spam:** Un usuario no puede calificar una máquina a menos que haya formalizado un contrato de alquiler que haya sido completado o pagado.
2. **Control de Duplicados:** Cada contrato solo puede generar una única calificación técnica (`UNIQUE (reservation_id)`).
3. **Métricas de Calidad en Catálogo:** El sistema recalcula dinámicamente el promedio ponderado de estrellas (1.0 a 5.0) y el conteo total de opiniones, impactando directamente la visibilidad de la herramienta.

---

## 🏗️ Ubicación de los Componentes en el Proyecto

### 1. Base de Datos (PostgreSQL)
- **Tabla:** `reviews`
  ```sql
  CREATE TABLE IF NOT EXISTS reviews (
      id BIGSERIAL PRIMARY KEY,
      tool_id BIGINT NOT NULL,
      client_id BIGINT NOT NULL,
      reservation_id BIGINT NOT NULL UNIQUE,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_reviews_tool FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE,
      CONSTRAINT fk_reviews_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
      CONSTRAINT fk_reviews_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE RESTRICT
  );
  ```

### 2. Módulo Dominio (`renta-domain`)
- **Entidad:** [Review.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-domain/src/main/java/com/renta/domain/model/entity/Review.java)
- **Value Object:** [ToolRatingSummary.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-domain/src/main/java/com/renta/domain/model/vo/ToolRatingSummary.java)
- **Puerto de Entrada:** [CreateReviewUseCase.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-domain/src/main/java/com/renta/domain/port/in/CreateReviewUseCase.java)
- **Puerto de Salida:** [ReviewRepositoryPort.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-domain/src/main/java/com/renta/domain/port/out/ReviewRepositoryPort.java)

### 3. Módulo Aplicación (`renta-application`)
- **Servicio de Aplicación:** [ReviewApplicationService.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-application/src/main/java/com/renta/application/service/ReviewApplicationService.java)
- **DTOs:** `CreateReviewRequest`, `ReviewResponse`, `ToolRatingSummaryResponse`

### 4. Módulo Infraestructura (`renta-infrastructure`)
- **Controlador REST:** [ReviewController.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/adapter/in/rest/ReviewController.java)

---

## 🔌 Endpoints REST

### 1. Publicar Reseña y Calificación
- **POST** `/api/v1/reviews`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Payload Request:**
```json
{
  "reservationId": 1,
  "rating": 5,
  "comment": "Rendimiento excelente en vaciado de losa. Motor en óptimo estado y bajo consumo de combustible."
}
```

### 2. Consultar Calificaciones y Promedio de una Herramienta
- **GET** `/api/v1/reviews/tool/{toolId}`
- **Respuesta Exitosa (`200 OK`):**
```json
{
  "toolId": 1,
  "averageRating": 4.8,
  "totalReviews": 12,
  "reviews": [
    {
      "id": 1,
      "clientName": "Carlos Gómez Construcciones",
      "rating": 5,
      "comment": "Rendimiento excelente en vaciado de losa. Motor en óptimo estado y bajo consumo de combustible.",
      "createdAt": "2026-10-25T14:30:00Z"
    }
  ]
}
```

---

## 🖥️ Interfaz de Usuario (React 18)

1. **Modal de Calificación ([CreateReviewModal.tsx](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/frontend/src/components/common/CreateReviewModal.tsx)):**
   - Selector interactivo de 1 a 5 estrellas con efecto hover y feedback textual (*"Excelente 5/5"*, *"Muy Buena 4/5"*...).
   - Área de texto para feedback técnico de obra.
2. **Integración en Portal Cliente ([ClientPortal.tsx](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/frontend/src/components/client/ClientPortal.tsx)):**
   - En las tarjetas de reservas finalizadas o pagadas, se despliega el botón dorado **`⭐ Calificar`**.
   - Al completar la reseña, se emite un toast de confirmación y se actualiza el estado.
3. **Pestaña de Reseñas en Detalle ([ToolDetailModal.tsx](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/frontend/src/components/catalog/ToolDetailModal.tsx)):**
   - En la pestaña de Preguntas & Reseñas, se exhibe el promedio consolidado `4.8 / 5.0` y la lista de testimonios firmados por constructoras reales.

---

## 💡 Defensa en el Examen (Argumentos Técnicos)
- **Integridad Referencial Cruzada:** "El sistema impide calificaciones fraudulentas validando que la reserva pertenezca al cliente solicitante y que el contrato se encuentre en estado finalizado o liquidado."
- **Cálculo Agregado en Dominio:** "El promedio ponderado de satisfacción no se recalcula con consultas pesadas completas, sino mediante agregaciones optimizadas en el puerto de repositorio."
