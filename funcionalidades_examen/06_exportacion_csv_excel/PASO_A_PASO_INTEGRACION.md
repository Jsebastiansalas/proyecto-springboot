# 📋 Funcionalidad 6: Exportación de Reportes a CSV / Excel

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).

---

## 🎯 ¿Qué problema de negocio resuelve?
Permite a los administradores y proveedores descargar informes operativos y financieros directamente en formato CSV compatible con Microsoft Excel, Google Sheets o sistemas contables:
1. Incluye BOM UTF-8 (`\uFEFF`) para garantizar que tildes, caracteres especiales en español y símbolos de moneda abran correctamente sin caracteres corruptos.
2. Escapado automático de comas, comillas dobles y saltos de línea según la norma RFC 4180.
3. Descarga vía streaming HTTP con encabezados `Content-Disposition` y nombre de archivo con timestamp dinámico.

---

## 🏗️ Ubicación de los Componentes en el Proyecto

### 1. Módulo Aplicación (`renta-application`)
- **Servicio de Exportación:** [CsvReportExporter.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-application/src/main/java/com/renta/application/service/export/CsvReportExporter.java)
  - `exportReservationsToCsv(List<Reservation> reservations)`
  - `exportToolsToCsv(List<Tool> tools)`

### 2. Módulo Infraestructura (`renta-infrastructure`)
- **Controlador REST:** [ReportExportController.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/adapter/in/rest/ReportExportController.java)

---

## 🔌 Endpoints REST

- **Prefijo:** `/api/v1/reports/export`
- **Seguridad:** Requiere token Bearer JWT con rol `ROLE_ADMIN` o `ROLE_PROVEEDOR`.

### 1. Descargar CSV de Reservas y Alquileres
- **GET** `/api/v1/reports/export/reservations/csv`
- **Headers de Respuesta:**
  - `Content-Type: text/csv; charset=UTF-8`
  - `Content-Disposition: attachment; filename="reporte_reservas_20261022_203000.csv"`

### 2. Descargar CSV de Inventario de Herramientas
- **GET** `/api/v1/reports/export/tools/csv`
- **Headers de Respuesta:**
  - `Content-Type: text/csv; charset=UTF-8`
  - `Content-Disposition: attachment; filename="reporte_herramientas_20261022_203000.csv"`

---

## 💡 Defensa en el Examen (Argumentos Técnicos)
- **Cero Dependencias Externas Pesadas:** Implementado con Java puro y Streams sin necesidad de librerías de 50MB como Apache POI, manteniendo el artefacto liviano y el tiempo de arranque óptimo.
- **Formato RFC 4180 Estricto:** Encapsulado correcto de celdas con comillas y escape de comillas internas (`""`), evitando roturas de columnas al importar en hojas de cálculo.
