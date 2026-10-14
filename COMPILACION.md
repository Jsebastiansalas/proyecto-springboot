# Guía de Compilación y Construcción del Proyecto

Esta guía describe los pasos técnicos y requerimientos para compilar, probar y generar los artefactos ejecutables de la plataforma **RentaMaq**.

---

## 1. Requerimientos del Entorno de Desarrollo

Antes de compilar, verifica que tu estación de trabajo cuente con las siguientes herramientas instaladas y configuradas en el `PATH` del sistema:

| Herramienta | Versión Requerida | Comando de Verificación |
| :--- | :--- | :--- |
| **Java Development Kit (JDK)** | **21 LTS** (Eclipse Temurin, OpenJDK u Oracle) | `javac -version` y `java -version` |
| **Apache Maven** | **3.9.0 o superior** | `mvn -version` |
| **Git** | **2.40 o superior** | `git --version` |

> [!NOTE]
> Aunque el sistema operativo anfitrión disponga de versiones superiores de Java (por ejemplo Java 22 o 26), el proyecto está fijado explícitamente a `<maven.compiler.release>21</maven.compiler.release>` en el POM padre para garantizar total compatibilidad con Spring Boot 3.4.2 y servidores Apache Tomcat 10.1 (Jakarta EE 10).

---

## 2. Estructura Multi-Módulo Maven

El proyecto está configurado como un reactor multi-módulo coordinado por el POM raíz (`renta-parent`):

```text
proyecto_springboot/
├── pom.xml                   # POM Padre (Gestión centralizada de dependencias y plugins)
├── renta-domain/             # Módulo 1: Dominio Puro (Java 21 estándar, sin frameworks)
├── renta-application/        # Módulo 2: Casos de Uso y Servicios de Aplicación
├── renta-infrastructure/     # Módulo 3: Adaptadores JPA, Spring Security y REST
└── renta-boot/               # Módulo 4: Ensamblado, Spring Boot y Frontend SPA
```

El orden de compilación del reactor es:
1. `renta-parent` (POM raíz)
2. `renta-domain`
3. `renta-application`
4. `renta-infrastructure`
5. `renta-boot`

---

## 3. Comandos de Compilación

### A. Validación de la Estructura y Dependencias
Verifica que todos los POMs estén bien formados y que no existan conflictos de versiones:
```bash
mvn validate
```

### B. Compilación Completa del Código Fuente
Compila los archivos `.java` de todos los módulos en `target/classes`:
```bash
mvn compile
```

### C. Ejecución de Pruebas Unitarias del Dominio
El módulo `renta-domain` cuenta con suites de pruebas unitarias que validan:
- Cálculo dinámico de precios (tarifa diaria base e IVA 19%).
- Descuento semanal automático (15% para reservas de 7 o más días).
- Validación de objetos de valor inmutables (`Money`, `DateRange`, `Email`).
- Detección de solapamiento de fechas.
- Pureza del dominio (verificación de que no existen dependencias de Spring o JPA en `renta-domain`).

Para ejecutar únicamente los tests del dominio:
```bash
mvn -pl renta-domain test
```

### D. Empaquetado Completo con Pruebas
Limpia los directorios de compilación anteriores, ejecuta las pruebas y genera los empaquetados:
```bash
mvn clean package
```

### E. Empaquetado Rápido (Omitiendo Pruebas)
Útil durante desarrollo iterativo cuando solo se actualizan recursos estáticos o plantillas:
```bash
mvn clean package -DskipTests
```

---

## 4. Artefacto Resultante

Al finalizar exitosamente `mvn package`, el archivo final se genera en:

```text
renta-boot/target/renta-api.war
```

### Características del Artefacto WAR
- **Doble propósito**:
  1. **Ejecutable autónomo**: Contiene un Tomcat embebido y clase principal `RentaHerramientasApplication`, permitiendo ejecutarlo directamente con `java -jar renta-api.war`.
  2. **WAR estándar Jakarta EE 10**: Hereda de `SpringBootServletInitializer` y declara `spring-boot-starter-tomcat` con `<scope>provided</scope>`, permitiendo desplegarlo en un servidor Apache Tomcat 10.1 externo.
- **Tamaño aproximado**: ~62 MB (incluye todas las dependencias empaquetadas en `WEB-INF/lib`).
- **Recursos estáticos incluidos**: El frontend SPA completo (HTML5, Tailwind, JavaScript) se encuentra empaquetado en `WEB-INF/classes/static/`.

---

## 5. Solución de Problemas Comunes de Compilación

### Error: `Source option 21 is no longer supported` o versión de Java no compatible
- **Causa**: Maven está usando un JDK inferior a la versión 21.
- **Solución**: Configura la variable de entorno `JAVA_HOME` apuntando al JDK 21:
  ```powershell
  # En Windows PowerShell
  $env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
  $env:Path = "$env:JAVA_HOME\bin;" + $env:Path
  ```

### Error: `Unable to rename 'renta-api.war' to 'renta-api.war.original'`
- **Causa**: El archivo WAR está bloqueado porque la aplicación se encuentra en ejecución en otra terminal.
- **Solución**: Detén el proceso Java activo antes de ejecutar `mvn package`:
  ```powershell
  # En Windows
  Get-Process -Name "java" | Stop-Process -Force
  ```

### Problemas de codificación de caracteres en Windows
- **Solución**: Asegura que Maven y la JVM usen codificación UTF-8:
  ```powershell
  $env:MAVEN_OPTS = "-Dfile.encoding=UTF-8"
  ```
