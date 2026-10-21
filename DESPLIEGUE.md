# Guía de Despliegue en Servidores y Contenedores

Esta guía documenta los métodos completos para desplegar la plataforma **RentaMaq**: ejecución embebida, despliegue nativo en servidores **Linux (Ubuntu/Debian con systemd y Nginx)**, despliegue en servidor de aplicaciones externo **Apache Tomcat 10.1** (Jakarta EE 10), y orquestación con **Docker Compose**.

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
1. **Esquema relacional (17 tablas en 4FN)**: [sql/schema.sql](sql/schema.sql)
2. **Datos semilla (roles, usuarios, clientes, proveedores, catálogo y reservas)**: [sql/data.sql](sql/data.sql)

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

### Paso 1: Compilar el Frontend y el WAR
Para asegurar que los últimos cambios visuales estén empaquetados en el WAR:
```bash
# 1. Compilar los assets del frontend (genera /frontend/dist en ~500ms)
cd frontend
npm run build
cd ..

# 2. Empaquetar el WAR integrado con Maven
mvn clean package -DskipTests
```

> [!TIP]
> **Desarrollo Rápido de Frontend (Hot Reload / HMR):**  
> Durante el desarrollo visual, no es necesario recompilar el WAR. Puedes iniciar el servidor de desarrollo de Vite:
> ```bash
> cd frontend
> npm run dev
> ```
> Abrirá la interfaz en `http://localhost:5173` con recarga instantánea (<50 ms) y redirigirá automáticamente todas las peticiones `/api/*` al backend Spring Boot en `http://localhost:8080`.

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

## 3. Método 2: Despliegue Nativo en Servidores Linux (Ubuntu / Debian / systemd)

Este método es el estándar para servidores de producción en la nube (VPS, AWS EC2, DigitalOcean, Hetzner, etc.) o servidores on-premise con Linux. Proporciona administración formal del proceso como servicio de sistema con **`systemd`** (reinicio automático ante fallos o reinicio del servidor) y un reverse proxy **Nginx** con soporte para certificados SSL/TLS y compresión HTTP.

### Paso 1: Instalar Paquetes y Dependencias del Sistema
Actualiza los repositorios e instala OpenJDK 21, Maven, PostgreSQL, Nginx y Node.js:

```bash
# 1. Actualizar el gestor de paquetes de la distribución
sudo apt update && sudo apt upgrade -y

# 2. Instalar OpenJDK 21 LTS, Maven, PostgreSQL, Nginx y utilidades
sudo apt install -y openjdk-21-jdk maven postgresql postgresql-contrib nginx git curl

# 3. Instalar Node.js 20 LTS (requerido para compilar el bundle frontend)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verificar que las versiones estén correctamente instaladas:
```bash
java -version    # Debe indicar OpenJDK 21
mvn -v           # Apache Maven 3.8+ o 3.9+
node -v          # v20.x
psql --version   # PostgreSQL 16+
```

---

### Paso 2: Configurar PostgreSQL en Linux
Inicia el servicio de base de datos y crea el usuario y la base de datos de producción:

```bash
# Habilitar e iniciar el servicio PostgreSQL
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Configurar contraseña de usuario postgres y crear la base de datos
sudo -u postgres psql << 'EOF'
CREATE USER postgres WITH PASSWORD 'Renta2026';
ALTER USER postgres WITH SUPERUSER;
CREATE DATABASE renta_db OWNER postgres ENCODING 'UTF8';
EOF
```

Poblar el esquema y los datos iniciales desde el directorio del proyecto:
```bash
cd /opt/rentamaq
PGPASSWORD=Renta2026 psql -h localhost -p 5432 -U postgres -d renta_db -f sql/schema.sql
PGPASSWORD=Renta2026 psql -h localhost -p 5432 -U postgres -d renta_db -f sql/data.sql
```

---

### Paso 3: Crear el Usuario de Sistema y Permisos de Seguridad
Por estándares de endurecimiento y seguridad (OWASP / CIS Benchmarks), **nunca** se debe ejecutar un servidor web o backend Java como usuario `root`. Crea un usuario de sistema dedicado sin login interactivo:

```bash
# Crear usuario de sistema dedicado 'rentamaq'
sudo useradd -r -m -U -d /opt/rentamaq -s /bin/bash rentamaq

# Clonar el proyecto al directorio de despliegue /opt/rentamaq
sudo git clone https://github.com/Jsebastiansalas/proyecto-springboot.git /opt/rentamaq

# Asignar la propiedad total del directorio al usuario rentamaq
sudo chown -R rentamaq:rentamaq /opt/rentamaq
```

---

### Paso 4: Compilar el Frontend y el Backend en Linux
Ejecuta la compilación con el usuario del sistema:

```bash
sudo -u rentamaq bash << 'EOF'
cd /opt/rentamaq/frontend
npm ci
npm run build

cd /opt/rentamaq
mvn clean package -DskipTests
EOF
```

El artefacto WAR compilado y empaquetado quedará ubicado en:  
`/opt/rentamaq/renta-boot/target/renta-api.war`

---

### Paso 5: Configurar el Servicio del Sistema (`systemd`)
Crea el archivo unitario de servicio para que Linux administre el ciclo de vida del backend (arranque al encender el servidor y reinicio automático en caso de caída):

```bash
sudo nano /etc/systemd/system/rentamaq.service
```

Pega la siguiente configuración de producción:

```ini
[Unit]
Description=RentaMaq Industrial Platform API & Web
After=syslog.target network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=rentamaq
Group=rentamaq
WorkingDirectory=/opt/rentamaq

# Variables de entorno para producción
Environment="PORT=8080"
Environment="SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/renta_db"
Environment="SPRING_DATASOURCE_USERNAME=postgres"
Environment="SPRING_DATASOURCE_PASSWORD=Renta2026"
Environment="JWT_SECRET=RentaHerramientasClaveSuperSeguraJWT2026ConMasDe256BitsParaHS256Firmado!"
Environment="JAVA_OPTS=-Xms512m -Xmx1024m -XX:+UseG1GC -Dfile.encoding=UTF-8"

# Comando de ejecución
ExecStart=/usr/bin/java $JAVA_OPTS -jar /opt/rentamaq/renta-boot/target/renta-api.war

# Políticas de reinicio y estabilidad
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=rentamaq

# Límites de recursos y seguridad
LimitNOFILE=65536
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

Habilitar e iniciar el servicio en el sistema operativo:
```bash
sudo systemctl daemon-reload
sudo systemctl enable rentamaq
sudo systemctl start rentamaq
```

Verificar que el servicio se encuentre activo (`active (running)`):
```bash
sudo systemctl status rentamaq
```

Para inspeccionar los logs en vivo:
```bash
sudo journalctl -u rentamaq -f
```

---

### Paso 6: Configurar Nginx como Reverse Proxy
Nginx recibirá las conexiones entrantes en los puertos estándar 80 (HTTP) y 443 (HTTPS), gestionará la compresión gzip y reenviará el tráfico internamente a Spring Boot en el puerto 8080:

Crea la configuración del virtual host:
```bash
sudo nano /etc/nginx/sites-available/rentamaq
```

Pega la siguiente configuración:

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com o-ip-del-servidor;

    client_max_body_size 50M;

    # Compresión gzip para máxima velocidad de entrega de assets
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        
        # Cabeceras requeridas para WebSockets y trazabilidad de IP del cliente
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Tiempos de espera
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Habilitar el sitio y reiniciar Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/rentamaq /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

*(Opcional) Activar Certificado SSL Gratuito con Let's Encrypt (Certbot):*
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

---

### Paso 7: Configuración del Cortafuegos (UFW)
Asegura los puertos de la máquina permitiendo únicamente el acceso a SSH, HTTP y HTTPS:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # Acceso administrativo SSH
sudo ufw allow 80/tcp    # Tráfico web HTTP
sudo ufw allow 443/tcp   # Tráfico web seguro HTTPS
sudo ufw enable
sudo ufw status
```

---

## 4. Método 3: Despliegue en Apache Tomcat 10.1 (Externo)

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

## 5. Método 4: Despliegue con Docker y Docker Compose

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

## 6. Tabla de Variables de Entorno en Producción

| Variable de Entorno | Valor por Defecto | Descripción |
| :--- | :--- | :--- |
| `SERVER_PORT` | `8080` | Puerto HTTP del servidor de aplicaciones. |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:1129/renta_db` | URL de conexión JDBC a la base de datos PostgreSQL. |
| `SPRING_DATASOURCE_USERNAME` | `postgres` | Usuario con permisos DML en la base de datos. |
| `SPRING_DATASOURCE_PASSWORD` | `Renta2026` | Contraseña de la base de datos. |
| `JWT_SECRET` | `RentaMaq2026...` | Clave secreta simétrica HS256 (mínimo 32 caracteres / 256 bits). |
| `JWT_EXPIRATION_MS` | `86400000` | Tiempo de vida del token JWT en milisegundos (24 horas). |

---

## 7. Credenciales de Prueba y Seguridad del Sistema

Las contraseñas de las cuentas demo están configuradas con hash **BCrypt (costo 12 / 4096 iteraciones)** y alta entropía:

| Rol | Correo Demostrativo | Contraseña Segura | Privilegios / Alcance |
| :--- | :--- | :--- | :--- |
| **Cliente** | `cliente1@correo.com` | `Cliente#Renta2026!Sec` | Ver catálogo, cotizar, crear reservas propias, ver facturas propias y cambiar contraseña. |
| **Proveedor** | `proveedor1@correo.com` | `Proveedor#Renta2026!Sec` | Gestionar inventario propio, responder cotizaciones/comentarios y cambiar contraseña. |
| **Administrador** | `admin@renta.com` | `Admin#Renta2026!SecOps` | Acceso a métricas de Actuator, gestión global de usuarios, resolución de disputas y auditoría. |

### Endpoints de Autenticación y Seguridad
- **`POST /api/v1/auth/login`**: Retorna token JWT simétrico de 256 bits. Si las credenciales fallan, responde **HTTP 401** conforme a RFC 7235.
- **`POST /api/v1/auth/change-password`**: Permite al usuario autenticado cambiar su contraseña validando la contraseña actual, complejidad de la nueva contraseña y no repetición.
- **Protección BOLA / IDOR**: Reglas a nivel de servicio `@authz` impiden que un cliente acceda a reservas, facturas o pagos de otros usuarios (responde HTTP 403 Forbidden).
- **Cabeceras de Seguridad OWASP Activas**: Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), X-Frame-Options (DENY/SAMEORIGIN), X-Content-Type-Options (nosniff) y Permissions-Policy.

---

## 8. Verificación Post-Despliegue (Smoke Test)

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

