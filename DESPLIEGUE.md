# Guía de Despliegue en Servidores y Contenedores

Esta guía documenta los tres métodos admitidos para desplegar la plataforma **RentaMaq**: ejecución embebida, despliegue en servidor de aplicaciones externo **Apache Tomcat 10.1** (Jakarta EE 10), y orquestación con **Docker Compose**.

---

## 1. Preparación de la Base de Datos (PostgreSQL 18)

Antes de iniciar la aplicación en cualquier entorno, la base de datos PostgreSQL debe estar creada y poblada.

### A. Crear la Base de Datos
En pgAdmin o mediante la consola `psql`:
```sql
CREATE DATABASE renta_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Spanish_Colombia.utf8'
    LC_CTYPE = 'Spanish_Colombia.utf8';
```

### B. Ejecución de los Scripts DDL y DML
Conéctate a la base de datos `renta_db` y ejecuta en orden:
1. **Esquema relacional (16 tablas en 4FN)**: [`sql/schema.sql`](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/sql/schema.sql)
2. **Datos semilla (roles, usuarios, clientes, proveedores, catálogo y reservas)**: [`sql/data.sql`](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/sql/data.sql)

Comando desde terminal:
```bash
psql -h localhost -p 1129 -U postgres -d renta_db -f sql/schema.sql
psql -h localhost -p 1129 -U postgres -d renta_db -f sql/data.sql
```

> [!TIP]
> En `application.yml`, la propiedad `spring.jpa.hibernate.ddl-auto` está configurada en `validate`. Esto garantiza que Hibernate verifique rigurosamente la concordancia exacta entre las entidades JPA y las 16 tablas sin alterar el esquema SQL.

---

## 2. Método 1: Despliegue Embebido (Standalone)

Este es el método más rápido y recomendado para desarrollo y servidores dedicados basados en contenedores o máquinas virtuales.

### Paso 1: Compilar el WAR
```bash
mvn clean package -DskipTests
```

### Paso 2: Ejecutar el Artefacto
```bash
java -jar renta-boot/target/renta-api.war
```

### Paso 3: Parámetros y Variables de Entorno Opcionales
Puedes sobreescribir cualquier propiedad de configuración al arrancar:
```bash
java -Dserver.port=8080 \
     -Dspring.datasource.url=jdbc:postgresql://localhost:1129/renta_db \
     -Dspring.datasource.username=postgres \
     -Dspring.datasource.password=Renta2026 \
     -Dapp.security.jwt-secret=RentaMaq2026SuperSecretKeySuperSecureAndLongEnoughForHS256BitSecurity \
     -jar renta-boot/target/renta-api.war
```

**Acceso**:
- Aplicación Web: `http://localhost:8080/`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

---

## 3. Método 2: Despliegue en Apache Tomcat 10.1 (Externo)

La aplicación implementa `SpringBootServletInitializer` y declara el starter de Tomcat con alcance `provided`, lo cual la habilita para ser desplegada como una aplicación web nativa en un servidor de aplicaciones externo compatible con **Jakarta EE 10** (Servlet Spec 6.0).

### Requerimientos de Tomcat
- **Versión**: **Apache Tomcat 10.1.x** (no usar Tomcat 9 ni anteriores, ya que Spring Boot 3 requiere el namespace `jakarta.*`).
- **Java Runtime**: JDK 21 LTS configurado en `JAVA_HOME` o `JRE_HOME`.

### Pasos de Despliegue:

1. **Compilar el archivo WAR**:
   ```bash
   mvn clean package -DskipTests
   ```
2. **Copiar el WAR al directorio `webapps/` de Tomcat**:
   ```bash
   # En Windows
   copy renta-boot\target\renta-api.war C:\apache-tomcat-10.1.x\webapps\renta-api.war

   # En Linux / macOS
   cp renta-boot/target/renta-api.war /opt/tomcat/webapps/renta-api.war
   ```
3. **Configurar Variables de Entorno en Tomcat**:
   Crea o edita el archivo `setenv.sh` (Linux) o `setenv.bat` (Windows) en el directorio `bin/` de Tomcat:
   ```cmd
   rem bin/setenv.bat
   set "SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:1129/renta_db"
   set "SPRING_DATASOURCE_USERNAME=postgres"
   set "SPRING_DATASOURCE_PASSWORD=Renta2026"
   set "JAVA_OPTS=%JAVA_OPTS% -Dfile.encoding=UTF-8 -Xms512m -Xmx1024m"
   ```
4. **Iniciar Tomcat**:
   ```bash
   # En Windows
   C:\apache-tomcat-10.1.x\bin\startup.bat

   # En Linux
   /opt/tomcat/bin/startup.sh
   ```
5. **Acceso con Context Path**:
   Tomcat desplegará la aplicación en la ruta correspondiente al nombre del archivo (`/renta-api/`):
   - Aplicación Web: `http://localhost:8080/renta-api/`
   - Documentación Swagger: `http://localhost:8080/renta-api/swagger-ui.html`
   - *(El cliente JavaScript `api.js` detecta automáticamente este context path y adapta todas las llamadas a `/renta-api/api/v1/` sin necesidad de reconfiguración manual)*.

---

## 4. Método 3: Despliegue con Docker y Docker Compose

Si tu entorno cuenta con Docker Desktop o Docker Engine, puedes desplegar la arquitectura completa (Base de datos PostgreSQL + Servidor Tomcat con la aplicación) en un solo comando:

```bash
docker-compose up -d --build
```

### Servicios Orquestados:
1. **`db`**: Contenedor oficial `postgres:18-alpine` con el puerto `5432` expuesto y volumen de almacenamiento persistente.
2. **`app`**: Contenedor con compilación multi-etapa (Maven 3.9 + OpenJDK 21) desplegado en **Apache Tomcat 10.1**.
3. **`pgadmin`**: Interfaz visual de gestión en el puerto `5050` (`admin@renta.com` / `Admin123*`).

Para verificar el estado de los contenedores:
```bash
docker-compose ps
docker-compose logs -f app
```

Para detener los servicios:
```bash
docker-compose down
```

---

## 5. Tabla de Variables de Entorno en Producción

| Variable de Entorno | Valor por Defecto | Descripción |
| :--- | :--- | :--- |
| `SERVER_PORT` | `8080` | Puerto HTTP del servidor de aplicaciones. |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:1129/renta_db` | URL de conexión JDBC a la base de datos PostgreSQL. |
| `SPRING_DATASOURCE_USERNAME` | `postgres` | Usuario con permisos DML en la base de datos. |
| `SPRING_DATASOURCE_PASSWORD` | `Renta2026` | Contraseña de la base de datos. |
| `JWT_SECRET` | `RentaMaq2026...` | Clave secreta simétrica HS256 (mínimo 32 caracteres / 256 bits). |
| `JWT_EXPIRATION_MS` | `86400000` | Tiempo de vida del token JWT en milisegundos (24 horas). |

---

## 6. Verificación Post-Despliegue (Smoke Test)

Ejecuta estas pruebas en terminal para confirmar que la aplicación está 100% operativa:

```bash
# 1. Comprobar página principal (Frontend SPA)
curl -I http://localhost:8080/

# 2. Comprobar Swagger UI
curl -I http://localhost:8080/swagger-ui.html

# 3. Consultar catálogo público de herramientas (API REST)
curl -s http://localhost:8080/api/v1/tools | head -n 30
```
Todas las peticiones deben responder con código de estado HTTP `200 OK`.
