# 📋 Funcionalidad 5: Paginación y Filtros Dinámicos con JPA Specification

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).

---

## 🎯 ¿Qué problema de negocio resuelve?
Permite a los usuarios y clientes explorar el catálogo de maquinaria con filtros combinables dinámicamente y resultados paginados para optimizar el rendimiento y el consumo de memoria:
- Búsqueda por texto libre en nombre o descripción.
- Filtrado por rango de precios: `minPrice` y `maxPrice`.
- Filtrado por categoría: `categoryId`.
- Filtrado por marca: `brand`.
- Filtrado por estado: `status` (`DISPONIBLE`, `MANTENIMIENTO`, etc.).
- Soporte para ordenamiento dinámico (por precio, nombre, fecha de creación) y paginación mediante `Pageable`.

---

## 🏗️ Ubicación de los Componentes en el Proyecto

### 1. Módulo Aplicación (`renta-application`)
- **DTO Genérico de Paginación:** [PagedResponse.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-application/src/main/java/com/renta/application/dto/common/PagedResponse.java) (Record puro desacoplado de Spring Data).

### 2. Módulo Infraestructura (`renta-infrastructure`)
- **Especificación Dinámica:** [ToolSpecification.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/adapter/out/persistence/specification/ToolSpecification.java)
- **Repositorio Spring Data:** [SpringDataToolRepository.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/adapter/out/persistence/repository/SpringDataToolRepository.java) (extiende `JpaSpecificationExecutor<ToolJpaEntity>`).
- **Controlador REST:** [ToolPagedController.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/adapter/in/rest/ToolPagedController.java)

---

## 🔌 Endpoint REST

- **Método HTTP:** `GET`
- **Ruta:** `/api/v1/tools/paged`
- **Seguridad:** Acceso público.
- **Parámetros de Query:**
  - `page` (default 0)
  - `size` (default 10)
  - `query` (texto para buscar en nombre o descripción)
  - `categoryId` (ID de la categoría)
  - `brand` (ej. `Bosch`, `DeWalt`, `Caterpillar`)
  - `minPrice` (ej. `50000`)
  - `maxPrice` (ej. `300000`)
  - `status` (ej. `DISPONIBLE`)
  - `sort` (ej. `baseDailyPrice,asc` o `name,desc`)

### Ejemplo de URL de Prueba:
```http
GET /api/v1/tools/paged?page=0&size=5&brand=Bosch&minPrice=50000&maxPrice=250000&sort=baseDailyPrice,asc
```

### Ejemplo de Respuesta Exitosa (`200 OK`):
```json
{
  "content": [
    {
      "id": 1,
      "name": "Martillo Demoledor 30kg",
      "codeSku": "HERR-DEM-01",
      "brand": "Bosch",
      "model": "GSH 27 VC",
      "baseDailyPrice": 120000.00,
      "depositAmount": 300000.00,
      "status": "DISPONIBLE",
      "categoryName": "Demolición y Perforación"
    }
  ],
  "pageNumber": 0,
  "pageSize": 5,
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true,
  "empty": false
}
```

---

## 💡 Defensa en el Examen (Argumentos Técnicos)
- **Criteria API & JPA Specification:** En lugar de concatenar cadenas SQL propensas a SQL Injection o crear decenas de métodos de repositorio (`findByBrandAndPriceGreaterThan...`), `ToolSpecification` compone predicados dinámicos de forma segura y tipada en tiempo de compilación.
- **Pureza Hexagonal:** El DTO `PagedResponse<T>` reside en la capa de aplicación sin depender de clases de Spring Data (`org.springframework.data.domain.Page`), manteniendo la independencia del framework.
