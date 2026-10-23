# 📋 Funcionalidad 3: Gestión de Mantenimiento y Hoja de Vida de Maquinaria

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Base de Datos:** Tabla `tool_maintenances` creada con claves foráneas e índices.

---

## 🎯 ¿Qué problema de negocio resuelve?
Permite a los administradores y proveedores registrar mantenimientos preventivos o correctivos sobre las herramientas:
1. Al programar o iniciar mantenimiento, la herramienta cambia automáticamente su estado a `MANTENIMIENTO`, bloqueando su visibilidad para nuevos alquileres.
2. Guarda el historial técnico: tipo (`PREVENTIVO`, `CORRECTIVO`, `CALIBRACION`), técnico o taller asignado, descripción y costo estimado.
3. Al finalizar el mantenimiento con `finishMaintenance`, registra la fecha real de término, observaciones, costo final y **restaura automáticamente el estado de la herramienta a `DISPONIBLE`**.

---

## 🏗️ Ubicación de los Componentes en el Proyecto

### 1. Base de Datos (PostgreSQL)
- **Tabla:** `tool_maintenances`
- **Campos principales:** `tool_id`, `maintenance_type`, `status`, `start_date`, `expected_end_date`, `completion_date`, `cost`, `description`, `performed_by`.

### 2. Módulo Dominio (`renta-domain`)
- **Enums:** [MaintenanceType.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-domain/src/main/java/com/renta/domain/model/enums/MaintenanceType.java) y [MaintenanceStatus.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-domain/src/main/java/com/renta/domain/model/enums/MaintenanceStatus.java)
- **Entidad:** [ToolMaintenance.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-domain/src/main/java/com/renta/domain/model/entity/ToolMaintenance.java)
- **Puerto de Salida:** [ToolMaintenanceRepositoryPort.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-domain/src/main/java/com/renta/domain/port/out/ToolMaintenanceRepositoryPort.java)

### 3. Módulo Aplicación (`renta-application`)
- **DTOs:** [ScheduleMaintenanceRequest.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-application/src/main/java/com/renta/application/dto/maintenance/ScheduleMaintenanceRequest.java), [FinishMaintenanceRequest.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-application/src/main/java/com/renta/application/dto/maintenance/FinishMaintenanceRequest.java), [ToolMaintenanceResponse.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-application/src/main/java/com/renta/application/dto/maintenance/ToolMaintenanceResponse.java)
- **Servicio de Aplicación:** [ToolMaintenanceApplicationService.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-application/src/main/java/com/renta/application/service/ToolMaintenanceApplicationService.java)

### 4. Módulo Infraestructura (`renta-infrastructure`)
- **Entidad JPA:** [ToolMaintenanceJpaEntity.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/adapter/out/persistence/entity/ToolMaintenanceJpaEntity.java)
- **Repositorio Spring Data:** [SpringDataToolMaintenanceRepository.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/adapter/out/persistence/repository/SpringDataToolMaintenanceRepository.java)
- **Adaptador:** [ToolMaintenanceRepositoryAdapter.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/adapter/out/persistence/adapter/ToolMaintenanceRepositoryAdapter.java)
- **Controlador REST:** [ToolMaintenanceController.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/adapter/in/rest/ToolMaintenanceController.java)
- **Configuración de Bean:** Registrado en [ApplicationBeanConfiguration.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/config/ApplicationBeanConfiguration.java)

---

## 🔌 Endpoints REST

- **Prefijo:** `/api/v1/tools/maintenance`
- **Seguridad:** Requiere `ROLE_PROVEEDOR` o `ROLE_ADMIN`.

### 1. Registrar / Programar Mantenimiento
- **POST** `/api/v1/tools/maintenance`
```json
{
  "toolId": 1,
  "type": "PREVENTIVO",
  "startDate": "2026-10-25",
  "expectedEndDate": "2026-10-28",
  "description": "Cambio de escobillas, lubricación de motor y prueba de aislamiento eléctrico",
  "performedBy": "Taller Central Bosch Bogotá",
  "cost": 180000.00
}
```

### 2. Finalizar Mantenimiento y Rehabilitar Máquina
- **PATCH** `/api/v1/tools/maintenance/{id}/finish`
```json
{
  "completionDate": "2026-10-28",
  "notes": "Mantenimiento completado con éxito, pruebas de carga superadas",
  "actualCost": 175000.00
}
```

### 3. Consultar Historial de Mantenimientos por Herramienta
- **GET** `/api/v1/tools/maintenance/tool/{toolId}`

---

## 💡 Defensa en el Examen (Argumentos Técnicos)
- **Coherencia del Ciclo de Vida:** La transición del estado de la maquinaria (`ToolStatus.DISPONIBLE` $\leftrightarrow$ `ToolStatus.MANTENIMIENTO`) se orquesta de forma consistente en el servicio de aplicación asegurando que no queden estados inconsistentes.
- **Trazabilidad:** Cada orden de mantenimiento guarda quién realizó el trabajo y la fecha de finalización, proporcionando auditoría completa.
