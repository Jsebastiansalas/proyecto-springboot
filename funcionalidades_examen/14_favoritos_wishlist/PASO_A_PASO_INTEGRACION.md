# Guía de Integración y Examen: Lista de Favoritos / Deseos del Cliente (Wishlist)

## 📌 Enunciado Típico de Examen
> *"Implemente una funcionalidad que permita a los clientes autenticados guardar herramientas en su lista de favoritos, consultar su catálogo de máquinas guardadas, verificar si un equipo está en favoritos y eliminar herramientas de su lista."*

---

## 🏛️ Componentes y Arquitectura Hexagonal

### 1. Base de Datos (PostgreSQL)
```sql
CREATE TABLE IF NOT EXISTS client_favorite_tools (
    client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    tool_id BIGINT NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (client_id, tool_id)
);
```

### 2. Dominio (`renta-domain`)
* **Puerto de Salida:** `ClientFavoriteToolRepositoryPort.java`
  - `addFavorite(Long clientId, Long toolId)`
  - `removeFavorite(Long clientId, Long toolId)`
  - `isFavorite(Long clientId, Long toolId)`
  - `findFavoriteToolIdsByClientId(Long clientId)`

### 3. Aplicación (`renta-application`)
* **DTO:** `FavoriteToolResponse.java` en `com.renta.application.dto.tool`.
* **Servicio:** `ClientFavoriteApplicationService.java` en `com.renta.application.service`.
  - Valida existencia previa de la herramienta y del cliente antes de asociar.

### 4. Infraestructura (`renta-infrastructure`)
* **Clave Compuesta JPA:** `ClientFavoriteId.java` (`@Embeddable`).
* **Entidad JPA:** `ClientFavoriteJpaEntity.java` (`@Entity` con `@EmbeddedId`).
* **Repositorio Spring Data:** `SpringDataClientFavoriteRepository.java`.
* **Adaptador de Persistencia:** `ClientFavoriteRepositoryAdapter.java`.
* **Configuración de Bean:** `ApplicationBeanConfiguration.java`.
* **Controlador REST:** `ClientFavoriteController.java`
  - `POST /api/v1/tools/{id}/favorite` (marcar favorita)
  - `DELETE /api/v1/tools/{id}/favorite` (desmarcar)
  - `GET /api/v1/tools/{id}/favorite` (consultar estado booleano)
  - `GET /api/v1/clients/my-favorites` (listar favoritos del cliente autenticado)

---

## 🚀 Cómo Defenderlo en el Examen
1. **Modelado de Clave Compuesta JPA:** Uso de `@Embeddable` / `@EmbeddedId` con `equals()` y `hashCode()` para relaciones Muchos a Muchos con atributos de auditoría (`added_at`).
2. **Seguridad Integrada:** El `clientId` se obtiene automáticamente del usuario autenticado en el token JWT, impidiendo que un usuario modifique la lista de otro.
