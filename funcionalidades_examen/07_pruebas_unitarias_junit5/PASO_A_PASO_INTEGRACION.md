# 📋 Funcionalidad 7: Pruebas Automatizadas (JUnit 5 + Mockito)

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Cobertura Clave:** Dominio puro (cálculos matemáticos, IVA y descuentos) y Capa de Aplicación (servicios con Mocks).

---

## 🎯 ¿Qué problema de negocio resuelve?
Garantiza la confiabilidad del sistema contra regresiones de código mediante pruebas unitarias exhaustivas con la versión moderna de **JUnit 5 (Jupiter)** y **Mockito**:
1. Verifica las reglas de redondeo y cálculo del IVA al 19% en el motor de precios `RentalPricingCalculator`.
2. Prueba los descuentos por alquiler prolongado (ej. alquiler de más de 7 días).
3. Prueba el ciclo de creación de reservas con Mockito simulando los puertos de persistencia (`ReservationRepositoryPort`, `ToolRepositoryPort`, `ClientRepositoryPort`), validando que lance `ToolNotAvailableException` si la máquina está en mantenimiento o `ReservationConflictException` si las fechas chocan con otra reserva.

---

## 🏗️ Ubicación de los Test Suites en el Proyecto

### 1. Pruebas Unitarias de Dominio Puro (`renta-domain`)
- **Archivo:** [RentalPricingCalculatorTest.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-domain/src/test/java/com/renta/domain/service/RentalPricingCalculatorTest.java)
- **Tecnología:** JUnit 5 puro (`@Test`, `@DisplayName`, `@ParameterizedTest`, `@ValueSource`).
- **Casos probados:**
  - Cálculo de 1 día de alquiler sin descuento.
  - Aplicación de descuento por semana completa (7+ días).
  - Cálculo exacto del IVA (19%) sobre el subtotal con descuento.
  - Validación de días no positivos (lanzamiento de excepción esperada).

### 2. Pruebas de Servicios con Mocks (`renta-application`)
- **Archivo:** [ReservationApplicationServiceTest.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-application/src/test/java/com/renta/application/service/ReservationApplicationServiceTest.java)
- **Tecnología:** JUnit 5 + Mockito (`@ExtendWith(MockitoExtension.class)`, `@Mock`, `@InjectMocks`).
- **Casos probados:**
  - Creación exitosa de reserva con guardado en repositorio y retorno de DTO en estado `PENDIENTE`.
  - Rechazo con `ToolNotAvailableException` cuando la máquina está en `ToolStatus.MANTENIMIENTO`.
  - Rechazo con `ReservationConflictException` cuando existe solapamiento en el calendario.

---

## ⚡ Comandos para Ejecutar las Pruebas

Para correr todas las pruebas del proyecto multi-módulo:
```powershell
mvn test
```

Para correr únicamente las pruebas de dominio:
```powershell
mvn test -pl renta-domain
```

Para correr únicamente las pruebas de aplicación:
```powershell
mvn test -pl renta-application
```

### Resultado esperado:
```text
[INFO] Reactor Summary for Plataforma Renta Herramientas - Parent 1.0.0:
[INFO] 
[INFO] Plataforma Renta Herramientas - Parent ............. SUCCESS
[INFO] Renta Herramientas - Domain ........................ SUCCESS
[INFO] Renta Herramientas - Application ................... SUCCESS
[INFO] Renta Herramientas - Infrastructure ................ SUCCESS
[INFO] Renta Herramientas - Boot & Packaging .............. SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
```

---

## 💡 Defensa en el Examen (Argumentos Técnicos)
- **Pirámide de Pruebas:** Las pruebas de dominio se ejecutan en microsegundos porque no inician ningún contexto de Spring Framework ni tocan bases de datos reales.
- **Aislamiento con Mockito:** Los servicios de aplicación se prueban aislando las dependencias mediante interfaces (Puertos SPI), garantizando que las pruebas no dependan del estado externo.
