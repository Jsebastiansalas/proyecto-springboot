# 📋 Funcionalidad 20: Tareas Programadas (@Scheduled Cron) & Centro de Notificaciones In-App con Campana

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Patrón de Diseño:** Observer / Event-Driven Asynchronous Scheduled Job  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos) y `@EnableScheduling` activo en `RentaHerramientasApplication`.  
> **Base de Datos:** Tabla `user_notifications` con índices de lectura y tipos de alerta.

---

## 🎯 ¿Qué problema de negocio resuelve?
En una plataforma de alquiler de maquinaria industrial, los usuarios no pueden depender únicamente de revisar manualmente sus fechas ni de esperar a que ocurra un error:
1. **Riesgo de Devolución Tardía no Deseada:** El contratista puede olvidar que su contrato vence en menos de 24 horas, incurriendo en costosas tarifas de mora diaria.
2. **Falta de Proactividad del Sistema:** En sistemas empresariales reales, el servidor ejecuta procesos en segundo plano (*background daemons*) de manera autónoma sin intervención humana.
3. **Comunicación In-App:** El usuario debe recibir notificaciones instantáneas sobre actas técnicas RETIE aprobadas, recordatorios de liquidación de pólizas y alertas de entrega en obra.

---

## ⚙️ Arquitectura del Proceso Programado (@Scheduled Cron)

### Configuración Global:
En [RentaHerramientasApplication.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-boot/src/main/java/com/renta/boot/RentaHerramientasApplication.java):
```java
@SpringBootApplication(scanBasePackages = "com.renta")
@EnableScheduling
@EntityScan(basePackages = "com.renta.infrastructure.adapter.out.persistence.entity")
@EnableJpaRepositories(basePackages = "com.renta.infrastructure.adapter.out.persistence.repository")
public class RentaHerramientasApplication extends SpringBootServletInitializer { ... }
```

### Expresión Cron Diaria:
- `cron = "0 0 8 * * *"`: Se dispara automáticamente todos los días a las 8:00 AM (hora Colombia).
- **Lógica de Ejecución:**
  1. Escanea todas las reservas en estado `APROBADA` o `EN_CURSO`.
  2. Filtra aquellas cuya fecha de finalización (`endDate`) coincide con el día de hoy o mañana ($\le 48\text{ horas}$).
  3. Verifica idempotencia en base de datos (`existsByUserIdAndTitleAndType`) para evitar saturar al cliente con mensajes repetidos.
  4. Crea un registro de tipo `ALERTA_VENCIMIENTO` con enlace directo al portal para gestionar la prórroga o coordinar el retorno en patio.

---

## 🏗️ Ubicación de los Componentes en el Proyecto

### 1. Base de Datos (PostgreSQL)
- **Tabla:** `user_notifications`
  ```sql
  CREATE TABLE IF NOT EXISTS user_notifications (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL,
      title VARCHAR(200) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) NOT NULL DEFAULT 'SISTEMA',
      is_read BOOLEAN NOT NULL DEFAULT false,
      link_url VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX idx_notifications_user_read ON user_notifications(user_id, is_read);
  ```

### 2. Capa de Infraestructura (`renta-infrastructure`)
- **Entidad JPA:** [UserNotificationJpaEntity.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/adapter/out/persistence/entity/UserNotificationJpaEntity.java)
- **Repositorio Spring Data:** [SpringDataUserNotificationRepository.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/adapter/out/persistence/repository/SpringDataUserNotificationRepository.java)
- **Controlador REST & Cron:** [NotificationController.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/adapter/in/rest/NotificationController.java)

---

## 🔌 Endpoints REST

| Método | Ruta | Descripción |
| :---: | :--- | :--- |
| `GET` | `/api/v1/notifications/my` | Lista notificaciones del usuario autenticado ordenadas por fecha reciente |
| `GET` | `/api/v1/notifications/my/unread-count` | Retorna el número de notificaciones no leídas para el badge |
| `PATCH` | `/api/v1/notifications/{id}/read` | Marca una notificación específica como leída |
| `PATCH` | `/api/v1/notifications/my/read-all` | Marca todas las notificaciones del usuario como leídas |
| `POST` | `/api/v1/notifications/trigger-expiration-alerts` | **Disparo manual del Scheduler:** Ejecuta el escáner de vencimientos en vivo para demostración en el examen |

### Ejemplo de Respuesta al Disparar el Scheduler (`200 OK`):
```json
{
  "status": "SUCCESS",
  "executionDate": "2026-10-25",
  "scannedReservations": 12,
  "alertsCreated": 3,
  "message": "Escaneo de vencimientos completado satisfactoriamente por el scheduler de fondo."
}
```

---

## 🖥️ Interfaz de Usuario (React 18)

1. **Campana de Alertas en Navbar ([NotificationBell.tsx](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/frontend/src/components/common/NotificationBell.tsx)):**
   - Icono `Bell` ubicado en el Header junto al carrito de cotización.
   - Badge numérico en rojo brillante (`unreadCount`) con efecto de pulso cuando hay mensajes nuevos.
2. **Dropdown Panel de Notificaciones:**
   - Discriminación por icono y color según el tipo (`ALERTA_VENCIMIENTO` ambar, `ESTADO_RESERVA` verde, `SISTEMA` azul).
   - Tiempos relativos en formato amigable (*"Hace 15 min"*, *"Hace 2 horas"*).
   - Botón *"Leídas"* para marcar todas al instante.
3. **Botón de Simulación para el Jurado en Vivo:**
   - Botón inferior: `⚡ Simular Scheduler`. Al pulsarlo, el frontend invoca `POST /api/v1/notifications/trigger-expiration-alerts`, escanea la base de datos en tiempo real y despliega las nuevas alertas generadas con un banner de confirmación.

---

## 💡 Defensa en el Examen (Argumentos Técnicos)
- **Desacoplamiento de Procesos Batch:** "Demuestra que la arquitectura no solo responde a peticiones síncronas de clientes, sino que incorpora tareas batch autónomas en segundo plano mediante `@EnableScheduling` y expresiones cron estandarizadas."
- **Idempotencia y Eficiencia:** "El scheduler valida previamente la existencia de la notificación en base de datos para no generar duplicados, protegiendo tanto la base de datos como la experiencia del usuario."
