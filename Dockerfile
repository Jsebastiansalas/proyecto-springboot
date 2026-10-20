# ==============================================================================
# Dockerfile Multi-Etapa: Plataforma RentaMaq (Java 21 + Tomcat 10.1)
# ==============================================================================

# ----------------- ETAPA 1: Compilación con Maven y JDK 21 -----------------
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Instalar Node.js y npm en la etapa de compilación para construir el frontend Vite
RUN apk add --no-cache nodejs npm

# Copiar descriptores de dependencias primero para optimizar cache de capas
COPY pom.xml .
COPY renta-domain/pom.xml renta-domain/
COPY renta-application/pom.xml renta-application/
COPY renta-infrastructure/pom.xml renta-infrastructure/
COPY renta-boot/pom.xml renta-boot/
# Copiar dependencias de frontend
COPY frontend/package*.json frontend/

# Descargar dependencias en cache
RUN cd frontend && npm install
RUN mvn dependency:go-offline -B || true

# Copiar el código fuente completo
COPY renta-domain/src renta-domain/src
COPY renta-application/src renta-application/src
COPY renta-infrastructure/src renta-infrastructure/src
COPY renta-boot/src renta-boot/src
COPY frontend/src frontend/src
COPY frontend/public frontend/public
COPY frontend/index.html frontend/index.html
COPY frontend/vite.config.ts frontend/vite.config.ts
COPY frontend/tsconfig*.json frontend/
COPY frontend/tailwind.config.js frontend/tailwind.config.js
COPY frontend/postcss.config.js frontend/postcss.config.js

# Compilar frontend Vite antes de empaquetar Maven
RUN cd frontend && npm run build

# Compilar y empaquetar el artefacto WAR sin ejecutar pruebas en el contenedor
RUN mvn clean package -DskipTests -B

# ----------------- ETAPA 2: Runtime con Apache Tomcat 10.1 -----------------
FROM tomcat:10.1-jdk21-temurin-jammy

LABEL maintainer="RentaMaq DevTeam <soporte@renta.com>"
LABEL description="RentaMaq - Servidor de Aplicaciones Apache Tomcat 10.1 con Spring Boot 3.4.2 y Java 21 LTS"

# Limpiar aplicaciones de ejemplo por defecto de Tomcat
RUN rm -rf /usr/local/tomcat/webapps/*

# Copiar el WAR compilado desde la etapa 1 como ROOT.war para servir en la raíz '/'
COPY --from=builder /build/renta-boot/target/renta-api.war /usr/local/tomcat/webapps/ROOT.war

# Variables de entorno JVM y de aplicación
ENV JAVA_OPTS="-Dfile.encoding=UTF-8 -XX:+UseG1GC -Xms256m -Xmx768m"
ENV SPRING_DATASOURCE_URL="jdbc:postgresql://postgres:5432/renta_db"
ENV SPRING_DATASOURCE_USERNAME="postgres"
ENV SPRING_DATASOURCE_PASSWORD="Renta2026"

EXPOSE 8080

CMD ["catalina.sh", "run"]
