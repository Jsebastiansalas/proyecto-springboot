# 🎓 MANUAL MAESTRO DE FUNCIONALIDADES PARA EXAMEN PRÁCTICO
## Sistema RentaMaq — Spring Boot 3 + Arquitectura Hexagonal + React 18

> **ESTADO GLOBAL:** ✅ **LAS 40 FUNCIONALIDADES SE ENCUENTRAN RIGUROSAMENTE ARQUITECTADAS, DOCUMENTADAS Y VERIFICADAS EN EL PROYECTO.**  
> - **Backend:** Multi-módulo Maven (`renta-domain`, `renta-application`, `renta-infrastructure`, `renta-boot`) con pruebas unitarias de dominio y persistencia transaccional.
> - **Frontend:** Vite + React 18 con TypeScript y diseño UI industrial, compilado y sincronizado en `renta-boot/src/main/resources/static/`.
> - **Base de Datos:** PostgreSQL relacional con claves foráneas, índices de no-solapamiento, bloqueo concurrente y vistas de telemetría.

---

## 🗺️ Directorio Consolidado de las 40 Funcionalidades

### 🔹 Lote 1: Operaciones Centrales y Alquileres (01 a 07)

| No. | Carpeta | Funcionalidad | Endpoints / Componentes Integrados | Guía Detallada |
| :---: | :--- | :--- | :--- | :---: |
| **01** | `01_prorroga_extension_reserva` | **Prórroga / Extensión de Reserva** | `PATCH /api/v1/reservations/{id}/extend` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/01_prorroga_extension_reserva/PASO_A_PASO_INTEGRACION.md) |
| **02** | `02_cupones_descuento` | **Sistema de Cupones Promocionales** | `POST /api/v1/coupons/validate` (Tabla `discount_coupons`) | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/02_cupones_descuento/PASO_A_PASO_INTEGRACION.md) |
| **03** | `03_mantenimiento_equipos` | **Mantenimiento Técnico, Taller & Hoja de Vida** | `/api/v1/tools/maintenance`<br>`ProviderPortal.tsx`, `ToolDetailModal.tsx` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/03_mantenimiento_equipos/PASO_A_PASO_INTEGRACION.md) |
| **04** | `04_cancelacion_penalizaciones` | **Cancelación con Penalización** | `PATCH /api/v1/reservations/{id}/cancel-with-penalty` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/04_cancelacion_penalizaciones/PASO_A_PASO_INTEGRACION.md) |
| **05** | `05_filtros_avanzados_paginacion` | **Paginación y Filtros Dinámicos** | `GET /api/v1/tools/paged` (`JpaSpecificationExecutor`) | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/05_filtros_avanzados_paginacion/PASO_A_PASO_INTEGRACION.md) |
| **06** | `06_exportacion_csv_excel` | **Exportación a CSV / Excel** | `GET /api/v1/reports/export/reservations/csv`, `tools/csv` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/06_exportacion_csv_excel/PASO_A_PASO_INTEGRACION.md) |
| **07** | `07_pruebas_unitarias_junit5` | **Pruebas Automatizadas JUnit 5** | Tests de Dominio y Aplicación (`mvn test`) | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/07_pruebas_unitarias_junit5/PASO_A_PASO_INTEGRACION.md) |

---

### 🔹 Lote 2: Arquitectura de Seguridad, Auditoría y Riesgos (08 a 14)

| No. | Carpeta | Funcionalidad | Endpoints / Componentes Integrados | Guía Detallada |
| :---: | :--- | :--- | :--- | :---: |
| **08** | `08_devolucion_tardia_mora` | **Devolución Tardía y Mora Diaria** | `GET /api/v1/returns/late-settlement/{reservationId}` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/08_devolucion_tardia_mora/PASO_A_PASO_INTEGRACION.md) |
| **09** | `09_seguro_todo_riesgo` | **Seguro Todo Riesgo (Damage Waiver)** | `POST /api/v1/reservations/calculate-price` & `reservations` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/09_seguro_todo_riesgo/PASO_A_PASO_INTEGRACION.md) |
| **10** | `10_recargo_fin_de_semana` | **Recargo de Fin de Semana (20%)** | `RentalPricingCalculator.calculateWithWeekendSurcharge` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/10_recargo_fin_de_semana/PASO_A_PASO_INTEGRACION.md) |
| **11** | `11_auditoria_estados` | **Pista de Auditoría de Estados** | `GET /api/v1/reservations/{id}/audit-trail` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/11_auditoria_estados/PASO_A_PASO_INTEGRACION.md) |
| **12** | `12_stock_multiunidad` | **Stock Multi-Unidad y Anti-Overbooking** | Control concurrente en `ReservationApplicationService` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/12_stock_multiunidad/PASO_A_PASO_INTEGRACION.md) |
| **13** | `13_bloqueo_usuarios_morosos` | **Bloqueo de Cuentas por Admin** | `PATCH /api/v1/admin/users/{id}/lock` / `unlock` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/13_bloqueo_usuarios_morosos/PASO_A_PASO_INTEGRACION.md) |
| **14** | `14_favoritos_wishlist` | **Lista de Favoritos (Wishlist)** | `/api/v1/tools/{id}/favorite` & `/clients/my-favorites` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/14_favoritos_wishlist/PASO_A_PASO_INTEGRACION.md) |

---

### 🔹 Lote 3: Industria Pesada, Normativa RETIE, Fintech Trust Score y DIAN (15 a 19)

| No. | Carpeta | Funcionalidad | Endpoints / Componentes Integrados | Guía Detallada |
| :---: | :--- | :--- | :--- | :---: |
| **15** | `15_checklist_tecnico_retie_acta_4fn` | **Checklist Pre-Despacho RETIE & Certificado** | `POST /api/v1/deliveries`, `GET /deliveries/{id}/checklist`<br>`DispatchModal.tsx`, `RetieCertificateModal.tsx` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/15_checklist_tecnico_retie_acta_4fn/PASO_A_PASO_INTEGRACION.md) |
| **16** | `16_score_confiabilidad_contratista_trust_score` | **Score de Confiabilidad (Trust Score)** | `GET /api/v1/clients/{id}/trust-score`, `/clients/my/trust-score`<br>Exención 50% fianza en `ClientPortal.tsx` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/16_score_confiabilidad_contratista_trust_score/PASO_A_PASO_INTEGRACION.md) |
| **17** | `17_liquidacion_tributaria_dian_retenciones` | **Liquidación DIAN & Retenciones Fiscales** | IVA 19%, Retefuente 4%, ReteIVA 15%, ReteICA, CUFE<br>`DianTaxSettlementModal.tsx`, `ProviderPortal.tsx` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/17_liquidacion_tributaria_dian_retenciones/PASO_A_PASO_INTEGRACION.md) |
| **18** | `18_verificador_disponibilidad_timeline_fechas` | **Verificador Disponibilidad & Calendario** | Detección algorítmica de no-solapamiento de fechas<br>`ToolDetailModal.tsx` (Pestaña Disponibilidad) | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/18_verificador_disponibilidad_timeline_fechas/PASO_A_PASO_INTEGRACION.md) |
| **19** | `19_descuento_combo_paquete_multiequipo` | **Descuento Paquete Combo Multi-Equipo (10%)** | Bundle pricing dinámico con $\ge 2$ herramientas<br>`QuoteCartDrawer.tsx` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/19_descuento_combo_paquete_multiequipo/PASO_A_PASO_INTEGRACION.md) |

---

### 🔹 Lote 4: Tareas Programadas Asíncronas y Reputación Verificada (20 y 21)

| No. | Carpeta | Funcionalidad | Endpoints / Componentes Integrados | Guía Detallada |
| :---: | :--- | :--- | :--- | :---: |
| **20** | `20_tareas_programadas_scheduled_alertas_notificaciones` | **Tareas Programadas (@Scheduled) & Notificaciones In-App** | `@EnableScheduling`, `POST /api/v1/notifications/trigger-expiration-alerts`, `GET /my`<br>`NotificationBell.tsx` con badge y simulador en vivo | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/20_tareas_programadas_scheduled_alertas_notificaciones/PASO_A_PASO_INTEGRACION.md) |
| **21** | `21_sistema_calificaciones_reviews_testimonios` | **Calificación de Maquinaria (1-5★) & Reseñas Verificadas** | `POST /api/v1/reviews`, `GET /tool/{id}`<br>`CreateReviewModal.tsx`, `ClientPortal.tsx`, `ToolDetailModal.tsx` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/21_sistema_calificaciones_reviews_testimonios/PASO_A_PASO_INTEGRACION.md) |

---

### 🔹 Lote 5: Siniestros, Logística Pesada, Telemetría y Contratación Legal (22 a 30)

| No. | Carpeta | Funcionalidad | Endpoints / Componentes Integrados | Guía Detallada |
| :---: | :--- | :--- | :--- | :---: |
| **22** | `22_liquidacion_siniestros_descuento_fianza` | **Liquidación de Siniestros y Descuento de Fianza** | `POST /api/v1/damages`, `damage_reports`<br>Fórmula: $\text{Balance} = \text{Fianza} - \text{Daño} - \text{Mora}$ | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/22_liquidacion_siniestros_descuento_fianza/PASO_A_PASO_INTEGRACION.md) |
| **23** | `23_tarifas_escalonadas_volumen_dias` | **Tarifas Escalonadas por Volumen (Semanal / Mensual)** | `POST /api/v1/reservations/calculate-price`<br>$\ge 7$ días (-15%), $\ge 30$ días (-30%) | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/23_tarifas_escalonadas_volumen_dias/PASO_A_PASO_INTEGRACION.md) |
| **24** | `24_calculo_fletes_transporte_especializado` | **Cálculo de Fletes y Transporte Especializado** | `POST /api/v1/deliveries/quote-freight`<br>Pickup Patio, Furgón, Camión Grúa, Cama Baja | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/24_calculo_fletes_transporte_especializado/PASO_A_PASO_INTEGRACION.md) |
| **25** | `25_control_horometro_recargo_horas_extra` | **Control de Horómetro y Horas Extra de Motor** | `POST /api/v1/tools/{id}/telemetry-readings`<br>Base 8h/día, recargo por sobreuso de motor | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/25_control_horometro_recargo_horas_extra/PASO_A_PASO_INTEGRACION.md) |
| **26** | `26_firma_digital_contrato_pagare` | **Firma Digital de Contrato y Pagaré en Blanco** | Ley 527/1999 & CCo Art. 622, Hash SHA-256 + IP<br>`POST /api/v1/contracts/{id}/sign`, `ContractSignatureModal.tsx` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/26_firma_digital_contrato_pagare/PASO_A_PASO_INTEGRACION.md) |
| **27** | `27_alquiler_operador_certificado_maquinista` | **Alquiler con Maquinista / Operador Certificado** | Servicio de valor agregado (+$80.000 COP / turno diario)<br>Mitigación SST y certificación SENA | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/27_alquiler_operador_certificado_maquinista/PASO_A_PASO_INTEGRACION.md) |
| **28** | `28_reemplazo_maquinaria_garantia_obra` | **Sustitución Express por Falla (Hot-Swap en Garantía)** | `POST /api/v1/reservations/{id}/swap-tool`<br>Reemplazo inmediato sin sobrecosto de fianza | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/28_reemplazo_maquinaria_garantia_obra/PASO_A_PASO_INTEGRACION.md) |
| **29** | `29_kit_accesorios_consumibles_obra` | **Paquetes de Accesorios y Consumibles de Desgaste** | `POST /api/v1/reservations/{id}/add-accessories`<br>Accesorios retornables vs consumibles facturados | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/29_kit_accesorios_consumibles_obra/PASO_A_PASO_INTEGRACION.md) |
| **30** | `30_auditoria_seguridad_accesos_ip` | **Auditoría de Seguridad, Accesos por IP y Fallos** | OWASP Top 10 A09:2021, `security_audit_logs`<br>`GET /api/v1/admin/security-audit` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/30_auditoria_seguridad_accesos_ip/PASO_A_PASO_INTEGRACION.md) |

---

### 🔹 Lote 6: "Las 10 Cáscaras del Profesor": Resiliencia Empresarial, Concurrencia y Cumplimiento Avanzado (31 a 40)

| No. | Carpeta | Funcionalidad | Endpoints / Componentes Integrados | Guía Detallada |
| :---: | :--- | :--- | :--- | :---: |
| **31** | `31_idempotencia_api_pagos_reservas` | **Clave de Idempotencia (`Idempotency-Key`) en Pagos y Reservas** | Header `Idempotency-Key: <UUID>`, Filtro Spring & Cache 24h<br>Evita dobles cobros por timeout o doble clic | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/31_idempotencia_api_pagos_reservas/PASO_A_PASO_INTEGRACION.md) |
| **32** | `32_mantenimiento_predictivo_umbral_horas` | **Bloqueo Automático por Mantenimiento Predictivo (Horas de Motor)** | Umbral de horas de servicio acumuladas (ej. 250h diésel)<br>Disparo de evento y bloqueo de catálogo | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/32_mantenimiento_predictivo_umbral_horas/PASO_A_PASO_INTEGRACION.md) |
| **33** | `33_geocercas_restriccion_territorial_gps` | **Restricción Territorial de Operación y Validación de Geocercas** | Algoritmo Haversine, perímetro metropolitano vs intermunicipal<br>Sobretasa de seguro foráneo | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/33_geocercas_restriccion_territorial_gps/PASO_A_PASO_INTEGRACION.md) |
| **34** | `34_rate_limiting_proteccion_scraping` | **Rate Limiting & Throttling contra Web Scraping (Token Bucket)** | RFC 6585, `HTTP 429 Too Many Requests`<br>`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/34_rate_limiting_proteccion_scraping/PASO_A_PASO_INTEGRACION.md) |
| **35** | `35_anonimizacion_datos_habeas_data_gdpr` | **Anonimización de Datos Personales (Habeas Data) e Integridad DIAN** | Ley 1581/2012 & GDPR "Derecho al Olvido"<br>Anonimización irreversible sin violar libros fiscales | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/35_anonimizacion_datos_habeas_data_gdpr/PASO_A_PASO_INTEGRACION.md) |
| **36** | `36_transferencia_inter_patios_subarriendo` | **Transferencia de Flota Inter-Patios y Sub-Arriendo entre Sedes** | Traslado logístico `EN_TRANSITO` entre Patio Sur y Norte<br>Bloqueo pesimista concurrente | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/36_transferencia_inter_patios_subarriendo/PASO_A_PASO_INTEGRACION.md) |
| **37** | `37_webhooks_eventos_externos_erp` | **Webhooks Asíncronos con Firma HMAC-SHA256 para ERPs de Obra** | Integración con Procore/SAP, header `X-RentaMaq-Signature`<br>Despacho `@Async` con política de reintentos | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/37_webhooks_eventos_externos_erp/PASO_A_PASO_INTEGRACION.md) |
| **38** | `38_bloqueo_optimista_concurrencia_version` | **Control de Concurrencia Optimista con `@Version` (HTTP 409)** | Prevención de la "Actualización Perdida" (*Lost Update*)<br>Columna `version` JPA y `GlobalExceptionHandler` | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/38_bloqueo_optimista_concurrencia_version/PASO_A_PASO_INTEGRACION.md) |
| **39** | `39_turnos_rotativos_nocturno_24_7` | **Tarificación por Régimen de Turnos (Diurno 8h, Doble 16h, 24/7)** | Factores multiplicadores: Sencillo (1.0x), Doble (1.65x), 24h continuo (2.20x)<br>Cálculo de desgaste acelerado | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/39_turnos_rotativos_nocturno_24_7/PASO_A_PASO_INTEGRACION.md) |
| **40** | `40_paz_y_salvo_criptografico_cierre_obra` | **Certificado de Paz y Salvo Financiero & Técnico de Cierre de Obra** | Acta formal de finiquito con hash SHA-256 inmutable<br>Código QR para verificación de interventoría | [Ver Guía](file:///c:/Users/USUARIO/OneDrive/Documents/proyecto_springboot/funcionalidades_examen/40_paz_y_salvo_criptografico_cierre_obra/PASO_A_PASO_INTEGRACION.md) |

---

## ⚡ Guión de Demostración en Vivo para el Examen (2 Minutos)

### Demostración 1: Tareas Programadas (@Scheduled) y Notificaciones In-App
1. En la barra superior (`Navbar`), observa el icono de la **Campana 🔔 con badge numérico en rojo**.
2. Haz clic en la campana para abrir el **Centro de Alertas & Notificaciones**:
   - Observa las alertas existentes clasificadas por severidad (`ALERTA_VENCIMIENTO`, `ESTADO_RESERVA`, `SISTEMA`).
3. Para demostrar el background cron job al jurado, pulsa el botón **`⚡ Simular Scheduler`**:
   - El sistema invoca `POST /api/v1/notifications/trigger-expiration-alerts`.
   - Escanea la base de datos en segundo plano, detecta contratos que vencen en menos de 48 horas y crea la alerta in-app automáticamente sin recargar la página.

### Demostración 2: Calificación de Maquinaria y Feedback de Contratistas
1. Entra a **Mi Cuenta / Portal** (`ClientPortal`).
2. En una reserva finalizada o pagada, haz clic en el botón dorado **`⭐ Calificar`**.
3. Se despliega el modal interactivo con selección de 1 a 5 estrellas y texto de feedback técnico.
4. Tras enviar la reseña, ve a la ficha de la herramienta en el Catálogo ➔ Pestaña **"Consultas & Reseñas"**: verás la calificación recién registrada y el promedio consolidado `4.8 / 5.0`.

### Demostración 3: Mantenimiento y Bloqueo en Catálogo
1. Abre el catálogo en `http://localhost:5173/` o `http://localhost:8080/` y busca el **Compresor 50L**:
   - Su estado es `MANTENIMIENTO` y los botones de alquiler están deshabilitados.
2. Ingresa a **Patio Proveedores** ➔ pestaña **"Taller & Hoja de Vida"**:
   - Pulsa *"Completar"* en la orden activa del Ing. Gustavo Morales, ingresa costo final y notas.
   - El equipo se reincorpora automáticamente a `DISPONIBLE`.

### Demostración 4: Checklist RETIE y Certificado Oficial Imprimible
1. En **Patio Proveedores** ➔ pestaña **"Solicitudes & Despachos"**, pulsa **"Despachar Equipo"** en una reserva aprobada.
2. Marca los 5 puntos normativos de seguridad RETIE / OSHA (Aislamiento dieléctrico >5 MΩ, guardas mecánicas, calibración ONAC, fluidos, kit de EPP).
3. Ingresa la firma del inspector técnico y confirma el despacho.
4. Pulsa el botón **"Acta RETIE"**: se abre el **Certificado Oficial de Conformidad** listo para imprimir con sello SHA-256 y código QR.

### Demostración 5: Client Trust Score & Beneficio de Fianza
1. Ve a **Mi Cuenta / Portal** (`ClientPortal`).
2. En la parte superior se exhibe el banner del contratista: **Score: 100/100 · Nivel EXCELENTE (Platinum)** con **50% de exención en fianza**.
3. Pulsa el botón **"Retenciones DIAN"** en cualquier reserva: observa la fila *"Beneficio Trust Score: -50% fianza aplicada"*, liquidando solo la mitad del depósito requerido.

---

## 🏛️ Argumentos de Defensa Arquitectónica

1. **Arquitectura Hexagonal Estricta (Puertos y Adaptadores):**
   - El núcleo de negocio (`renta-domain`) no tiene ninguna dependencia de Spring, Hibernate ni bases de datos. Todo se define mediante puertos (`in` y `out`).
2. **Value Objects Inmutables y DDD:**
   - Conceptos como `DateRange`, `Money`, `ToolRatingSummary`, `GeoCoordinates` y `Email` garantizan invariantes de dominio desde su instanciación.
3. **Resiliencia e Idempotencia:**
   - El uso de `Idempotency-Key` en operaciones críticas de pago previene dobles transacciones ante fallos de red en obra.
4. **Concurrencia Optimista (@Version) y No-Overbooking:**
   - Previene el problema de la "Actualización Perdida" (*Lost Update*) respondiendo `HTTP 409 Conflict`, mientras que las reservas concurrentes verifican solapamientos deterministas en base de datos.
5. **Auditoría, Criptografía y Cumplimiento Normativo:**
   - La combinación de firma digital SHA-256, webhooks firmados con HMAC-SHA256, actas RETIE, paz y salvo final y anonimización de datos bajo Ley 1581 (Habeas Data) garantizan blindaje legal de nivel bancario e industrial.
