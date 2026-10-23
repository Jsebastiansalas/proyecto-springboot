# 📋 Funcionalidad 2: Sistema de Cupones de Descuento Promocionales

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Base de Datos:** Tabla `discount_coupons` creada con cupones semilla activos (`OBRA2026`, `PROMO10`, `BLACKFRIDAY`).

---

## 🎯 ¿Qué problema de negocio resuelve?
Permite a los usuarios aplicar códigos de descuento en cotizaciones o reservas de maquinaria. El sistema:
1. Valida que el cupón exista, esté activo y vigente dentro de su rango de fechas (`valid_from` - `valid_until`).
2. Comprueba que el alquiler cumpla los requisitos mínimos (ej. monto mínimo de subtotal y días mínimos de alquiler).
3. Calcula el descuento porcentual respetando el tope máximo de descuento (`max_discount_amount`).
4. Recalcula el subtotal neto con descuento y la base imponible del IVA (19%).

---

## 🏗️ Ubicación de los Componentes en el Proyecto

### 1. Base de Datos (PostgreSQL)
- **Tabla:** `discount_coupons`
- **Cupones precargados:**
  - `OBRA2026`: 15% de descuento (mínimo $300.000, mínimo 3 días, tope $500.000).
  - `PROMO10`: 10% de descuento (sin mínimo de alquiler, tope $200.000).
  - `BLACKFRIDAY`: 25% de descuento (mínimo $1.000.000, tope $1.500.000).

### 2. Módulo Dominio (`renta-domain`)
- **Entidad:** [Coupon.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-domain/src/main/java/com/renta/domain/model/entity/Coupon.java)
- **Puerto de Salida:** [CouponRepositoryPort.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-domain/src/main/java/com/renta/domain/port/out/CouponRepositoryPort.java)
- **Puerto de Entrada:** [ValidateCouponUseCase.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-domain/src/main/java/com/renta/domain/port/in/ValidateCouponUseCase.java)

### 3. Módulo Aplicación (`renta-application`)
- **DTO Request:** [ApplyCouponRequest.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-application/src/main/java/com/renta/application/dto/coupon/ApplyCouponRequest.java)
- **DTO Response:** [CouponValidationResponse.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-application/src/main/java/com/renta/application/dto/coupon/CouponValidationResponse.java)
- **Servicio de Aplicación:** [CouponApplicationService.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-application/src/main/java/com/renta/application/service/CouponApplicationService.java)

### 4. Módulo Infraestructura (`renta-infrastructure`)
- **Entidad JPA:** [CouponJpaEntity.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/adapter/out/persistence/entity/CouponJpaEntity.java)
- **Repositorio Spring Data:** [SpringDataCouponRepository.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/adapter/out/persistence/repository/SpringDataCouponRepository.java)
- **Adaptador de Persistencia:** [CouponRepositoryAdapter.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/adapter/out/persistence/adapter/CouponRepositoryAdapter.java)
- **Controlador REST:** [CouponController.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/adapter/in/rest/CouponController.java)
- **Configuración de Bean:** Registrado en [ApplicationBeanConfiguration.java](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/renta-infrastructure/src/main/java/com/renta/infrastructure/config/ApplicationBeanConfiguration.java)

---

## 🔌 Endpoint REST

- **Método HTTP:** `POST`
- **Ruta:** `/api/v1/coupons/validate`
- **Seguridad:** Público / Autenticado (accesible desde el checkout o cotizador).

### Ejemplo de Request Payload:
```json
{
  "couponCode": "OBRA2026",
  "startDate": "2026-11-01",
  "rentalDays": 7,
  "subtotalAmount": 1000000.00
}
```

### Ejemplo de Respuesta Exitosa (`200 OK`):
```json
{
  "code": "OBRA2026",
  "valid": true,
  "description": "Descuento del 15% para obras civiles e infraestructura",
  "discountPercentage": 15.00,
  "originalSubtotal": 1000000.00,
  "discountAmount": 150000.00,
  "discountedSubtotal": 850000.00,
  "taxAmount": 161500.00,
  "totalWithTax": 1011500.00,
  "message": "¡Cupón OBRA2026 aplicado exitosamente! Ahorraste $150,000.00 COP."
}
```

---

## 💡 Defensa en el Examen (Argumentos Técnicos)
- **Arquitectura Hexagonal:** El dominio contiene las reglas de validación del cupón (fechas, topes, montos mínimos) completamente aisladas de Spring Data y de la base de datos.
- **Auditoría e Inmutabilidad:** Los códigos de cupones se almacenan en mayúsculas (`UPPERCASE`) con restricción de unicidad (`UNIQUE`) e índices para búsqueda inmediata en O(1).
