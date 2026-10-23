# 🎓 BANCO DE FUNCIONALIDADES PARA EXAMEN PRÁCTICO
## Sistema RentaMaq — Spring Boot 3 + Arquitectura Hexagonal

> **ESTADO DE INTEGRACIÓN:** ✅ **LAS 14 FUNCIONALIDADES YA ESTÁN 100% INTEGRADAS, COMPILADAS Y PROBADAS EN EL PROYECTO PRINCIPAL.**  
> Todos los módulos (`renta-domain`, `renta-application`, `renta-infrastructure`, `renta-boot`) compilan con `BUILD SUCCESS` y 170 pruebas unitarias e integración pasando al 100%.  
> En esta carpeta se conservan **únicamente los Markdowns de integración (`PASO_A_PASO_INTEGRACION.md`)** para consulta rápida y defensa técnica durante el examen.

---

## 📂 Directorio Consolidado de Funcionalidades Integradas (14 en Total)

### 🔹 Lote 1: Funcionalidades Operativas y Financieras (01 a 07)

| Carpeta | Funcionalidad | Endpoints / Componentes Integrados | Guía Markdown |
| :--- | :--- | :--- | :---: |
| `01_prorroga_extension_reserva` | **Prórroga / Extensión de Reserva** | `PATCH /api/v1/reservations/{id}/extend` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/01_prorroga_extension_reserva/PASO_A_PASO_INTEGRACION.md) |
| `02_cupones_descuento` | **Sistema de Cupones Promocionales** | `POST /api/v1/coupons/validate` (Tabla `discount_coupons`) | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/02_cupones_descuento/PASO_A_PASO_INTEGRACION.md) |
| `03_mantenimiento_equipos` | **Mantenimiento y Hoja de Vida** | `/api/v1/tools/maintenance` (Tabla `tool_maintenances`) | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/03_mantenimiento_equipos/PASO_A_PASO_INTEGRACION.md) |
| `04_cancelacion_penalizaciones` | **Cancelación con Penalización** | `PATCH /api/v1/reservations/{id}/cancel-with-penalty` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/04_cancelacion_penalizaciones/PASO_A_PASO_INTEGRACION.md) |
| `05_filtros_avanzados_paginacion` | **Paginación y Filtros Dinámicos** | `GET /api/v1/tools/paged` (`JpaSpecificationExecutor`) | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/05_filtros_avanzados_paginacion/PASO_A_PASO_INTEGRACION.md) |
| `06_exportacion_csv_excel` | **Exportación a CSV / Excel** | `GET /api/v1/reports/export/reservations/csv`, `tools/csv` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/06_exportacion_csv_excel/PASO_A_PASO_INTEGRACION.md) |
| `07_pruebas_unitarias_junit5` | **Pruebas Automatizadas JUnit 5** | Tests de Dominio y Aplicación (`mvn test`) | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/07_pruebas_unitarias_junit5/PASO_A_PASO_INTEGRACION.md) |

---

### 🔹 Lote 2: Funcionalidades Avanzadas de Arquitectura y Negocio (08 a 14)

| Carpeta | Funcionalidad | Endpoints / Componentes Integrados | Guía Markdown |
| :--- | :--- | :--- | :---: |
| `08_devolucion_tardia_mora` | **Devolución Tardía y Mora Diaria** | `GET /api/v1/returns/late-settlement/{reservationId}` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/08_devolucion_tardia_mora/PASO_A_PASO_INTEGRACION.md) |
| `09_seguro_todo_riesgo` | **Seguro Todo Riesgo (Damage Waiver)** | `POST /api/v1/reservations/calculate-price` & `reservations` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/09_seguro_todo_riesgo/PASO_A_PASO_INTEGRACION.md) |
| `10_recargo_fin_de_semana` | **Recargo de Fin de Semana (20%)** | `RentalPricingCalculator.calculateWithWeekendSurcharge` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/10_recargo_fin_de_semana/PASO_A_PASO_INTEGRACION.md) |
| `11_auditoria_estados` | **Pista de Auditoría de Estados** | `GET /api/v1/reservations/{id}/audit-trail` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/11_auditoria_estados/PASO_A_PASO_INTEGRACION.md) |
| `12_stock_multiunidad` | **Stock Multi-Unidad y Anti-Overbooking** | Control concurrente en `ReservationApplicationService` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/12_stock_multiunidad/PASO_A_PASO_INTEGRACION.md) |
| `13_bloqueo_usuarios_morosos` | **Bloqueo de Cuentas por Admin** | `PATCH /api/v1/admin/users/{id}/lock` / `unlock` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/13_bloqueo_usuarios_morosos/PASO_A_PASO_INTEGRACION.md) |
| `14_favoritos_wishlist` | **Lista de Favoritos (Wishlist)** | `/api/v1/tools/{id}/favorite` & `/clients/my-favorites` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/14_favoritos_wishlist/PASO_A_PASO_INTEGRACION.md) |

---

## ⚡ ¿Cómo responder en el examen si te preguntan por alguna?

1. **Abre la guía de la funcionalidad correspondiente:** Dentro de cada subcarpeta encontrarás el archivo `PASO_A_PASO_INTEGRACION.md` con:
   - Explicación clara de la regla de negocio.
   - Enlace directo a cada archivo Java en `renta-domain`, `renta-application` y `renta-infrastructure`.
   - Ejemplos de payloads JSON y respuestas.
   - Argumentos de defensa técnica (Clean Architecture, DDD, seguridad y transaccionalidad).
2. **Demuéstralo en vivo en Swagger:**
   - Swagger UI: `http://localhost:8080/swagger-ui.html`
3. **Ejecuta las pruebas automatizadas:**
   - Comando: `mvn test` (170 pruebas pasando al 100%).
