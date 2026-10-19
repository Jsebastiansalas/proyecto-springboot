# Especificación de Diseño: RentaMaq Plataforma Industrial E-Commerce (Home, Catálogo y Gestión Local de Imágenes)

**Fecha:** 2026-10-15  
**Estado:** Final - Listo para Aprobación del Usuario  
**Documento:** `docs/superpowers/specs/2026-10-15-rentamaq-industrial-ecommerce-design.md`  
**Participantes:** Antigravity (Senior Full Stack Pair) + Usuario (Junior Developer)

---

## 1. Intención y Justificación (Intent & Why)

### Contexto
RentaMaq cuenta con una arquitectura de backend robusta (hexagonal, DDD, Spring Boot 3.4.2, PostgreSQL, 100% pruebas unitarias pasando). Sin embargo, el frontend actual carece de:
1. Una pantalla de bienvenida de alto impacto (Página Principal / Home) con fotografía industrial profesional que transmita seriedad técnica y corporativa a ingenieros, contratistas y maestros de obra.
2. Una experiencia de navegación fluida y orientada a la conversión inspirada en la usabilidad de Amazon (búsqueda rápida, categorización clara, filtros laterales completos en el catálogo y reserva ágil).
3. Una estructura simple y transparente para que el usuario administre y coloque manualmente sus propias fotos de herramientas sin depender de servicios de almacenamiento en la nube ni configuraciones complejas de base de datos.
4. Una identidad estética 100% industrial y sobria (grafito oscuro `#0f172a`, acero `#1e293b` y ámbar de seguridad `#f59e0b`), libre de emojis para proyectar máxima seriedad profesional.

---

## 2. Objetivos, No-Objetivos y Anti-Objetivos

### Objetivos (Goals)
- **G1. Carpeta local estática de imágenes:** Proveer un directorio `renta-boot/src/main/resources/static/images/tools/` donde el usuario coloque sus fotos en formato `.jpg` o `.png` nombradas según el código de la herramienta (ej. `HERR-001.jpg`, `DEMO-001.jpg`).
- **G2. Fallback de imagen resiliente:** Implementar un mecanismo de reemplazo automático (imagen vectorial por defecto / placeholder industrial `placeholder-tool.svg`) para que ninguna tarjeta del catálogo se rompa si la foto de una herramienta aún no ha sido cargada físicamente.
- **G3. Página Principal (Home) corporativa:**
  - Header industrial profesional sin emojis, con logotipo propio, buscador central con filtro de categoría, línea de atención técnica PBX y acceso a reservas activas.
  - Banner superior (Hero) fotográfico con llamada a la acción ("Explorar Catálogo de Equipos" y "Cotización para Empresas NIT").
  - 4 pilares de valor corporativo con iconos SVG vectoriales: Despacho a obra hoy, Mantenimiento preventivo certificado, Tarifa semanal automática (-15%) y Facturación electrónica.
  - Sección de las 4 líneas principales de maquinaria (Demolición, Compactación, Generación, Alturas).
  - Vitrina destacada ("Equipos Destacados de Mayor Rotación") con precio/día y botón directo de alquiler.
- **G4. Catálogo Completo estilo E-Commerce:**
  - Barra superior con contador dinámico de resultados y selector de ordenamiento (precio, disponibilidad, recomendados).
  - Filtros laterales tipo Amazon: por línea de maquinaria, marca, disponibilidad inmediata en bodega, rango de tarifas y búsqueda textual técnica.
  - Tarjetas de equipo detalladas con ficha técnica, disponibilidad en tiempo real, cálculo del descuento semanal y botones de acción ("Reservar Equipo" y "Ver Ficha Técnica").
- **G5. Cero emojis en la interfaz:** Todos los iconos son elementos vectoriales SVG limpios o tipografía industrial.
- **G6. Navegación fluida (SPA):** Alternancia inmediata entre la vista Home (`App.navigateView('home')`) y la vista Catálogo (`App.navigateView('catalog')`), manteniendo la compatibilidad con las vistas existentes de autenticación, cliente, proveedor y administrador.
- **G7. Ficha técnica interactiva modal:** El botón secundario de cada tarjeta abre el modal completo de especificaciones técnicas 4FN (`App.openToolDetail(toolId)`) con opción de imprimir para cotizaciones de obra.

### No-Objetivos (Non-Goals)
- No se implementará un gestor web de subida de archivos (upload multipart) desde el navegador; la carga de imágenes es explícitamente manual en disco por decisión del usuario.
- No se modificará el esquema de base de datos relacional PostgreSQL de la Fase 1 (`sql/schema.sql`).
- No se crearán servicios externos de CDN (S3, Cloudinary, etc.); todo se sirve localmente desde Spring Boot.

### Anti-Objetivos (Anti-Goals)
- **Anti-Goal 1: Clonación visual idéntica a Amazon.** No usar la paleta de colores de Amazon ni su tipografía. La identidad debe ser estrictamente de maquinaria de construcción pesada.
- **Anti-Goal 2: Uso de emojis.** Prohibido terminantemente el uso de emojis en títulos, botones, tarjetas o mensajes del sistema (nada de 🔍, 🚚, 🛡️, ⚙️, 🔥, etc.).
- **Anti-Goal 3: Vistas rotas por imágenes faltantes.** Ninguna herramienta del catálogo debe mostrar el ícono de imagen rota del navegador (`broken image icon`).

---

## 3. Restricciones Técnicas (Constraints)

1. **Stack Tecnológico Existente:**
   - Java 21, Spring Boot 3.4.2, Maven multi-módulo.
   - Frontend estático en `renta-boot/src/main/resources/static/` utilizando Tailwind CSS CDN, Vanilla JavaScript ES6 (`App` y `Api`), Chart.js y QRious.
   - Hexagonal DDD: El frontend consume la API REST a través de `js/api.js` hacia los endpoints existentes (`/api/tools`, `/api/rentals`, `/api/auth`, etc.).
2. **Servicio Estático de Recursos:**
   - Spring Boot sirve por defecto el directorio `src/main/resources/static/` en la raíz `/`.
   - Cualquier archivo colocado en `static/images/tools/<archivo>` es accesible públicamente en la URL `/images/tools/<archivo>`.
3. **Manejo de Permisos y Sesión:**
   - El catálogo y la página principal son completamente públicos e indexables; no requieren token JWT para consultar herramientas ni filtrar disponibilidad.

---

## 4. Decisiones de Arquitectura Tomadas con el Usuario

| Decisión | Opción Elegida | Razón y Contexto |
| :--- | :--- | :--- |
| **Ubicación de Imágenes** | `renta-boot/src/main/resources/static/images/tools/` | Permite al usuario arrastrar y soltar fotos directamente en su explorador de archivos de Windows; Spring Boot las sirve instantáneamente sin controladores extra. |
| **Convención de Nombres de Fotos** | `{codigo_herramienta}.jpg` (ej. `DEMO-001.jpg`) | Asocia de forma determinista la foto con la entidad sin requerir mutaciones en la base de datos. Si no existe, el evento `onerror` carga `/images/tools/placeholder-tool.svg`. |
| **Estilo Visual General** | Corporativo Industrial (Grafito `#0f172a`, Ámbar `#f59e0b`) | Aprobado explícitamente por el usuario para reflejar la seriedad técnica de una empresa de maquinaria pesada. |
| **Iconografía** | SVGs vectoriales integrados inline | Reemplaza al 100% los emojis para erradicar el aspecto artificial de IA. |
| **Estructura de Vistas** | Doble vista (Home + Catálogo Completo) | Permite dar la bienvenida con la propuesta de valor y luego pasar a una experiencia profunda de filtrado tipo Amazon. |
| **Acción de Ficha Técnica** | Modal interactivo detallado con impresión | Confirmado por el usuario para consultar especificaciones completas al instante sin descargas lentas de PDF. |

---

## 5. Decisiones del Desarrollador (Builder's Calls)

1. **Mapeo Taxonómico de Familias (Home vs. Categorías DB):**  
   La base de datos contiene 20 categorías planas. En el frontend, se agrupan client-side de forma transparente en las 4 familias industriales para la Home:
   - *Demolición y Perforación:* Categorías 1, 2, 11, 16 (Rotomartillos, Sierras, Amoladoras, Martillos demoledores).
   - *Compactación y Concreto:* Categorías 7, 8, 12, 17, 18 (Mezcladoras, Compactadoras, Allanadoras, Cortadoras pavimento, Vibradores).
   - *Generación, Bombeo e Iluminación:* Categorías 4, 5, 6, 14 (Compresores, Generadores, Bombas de agua, Torres iluminación).
   - *Trabajo Seguro en Alturas:* Categorías 3, 10, 15, 20 (Andamios, Montacargas, Escaleras/Plataformas, Seguridad).  
   Al hacer clic en cualquier familia de la Home, se navega al Catálogo activando el filtro de las categorías correspondientes.

2. **Filtros Laterales del Catálogo en Memoria:**  
   Para mantener la máxima velocidad (0 ms de latencia) y no romper el contrato de `ToolResponse`, los filtros laterales operarán en memoria sobre la lista de herramientas obtenida de `GET /api/v1/tools`:
   - *Categoría:* Dropdown o checkboxes basados en las 20 categorías reales de la base de datos.
   - *Marca:* Marcas presentes en el inventario (Bosch, DeWalt, Caterpillar, Wacker Neuson, Honda, etc.).
   - *Disponibilidad:* Filtro booleano por `tool.status === 'DISPONIBLE'`.
   - *Rango de Tarifa Diaria:* Menor a $50k, $50k-$100k, más de $100k.
   - *Búsqueda Rápida Técnica:* Filtro por texto libre sobre `name` y `description` (permite filtrar por "diésel", "eléctrico", "1500w", etc.).

3. **Comportamiento del Botón de Reserva Activa en el Header:**  
   Para visitantes no autenticados, el botón muestra "Reservar Equipo" o "Cotización (0)" y abre el modal de inicio de sesión o registro al pulsar. Para clientes autenticados, muestra el contador de sus alquileres activos consultando su sesión local (`App.currentUser`) y navega directamente a "Mis Alquileres" (`App.navigateView('client')`).

4. **Diseño del SVG de Placeholder:**  
   Se creará `renta-boot/src/main/resources/static/images/tools/placeholder-tool.svg` con el isotipo técnico de RentaMaq y una silueta industrial para que cualquier foto faltante luzca como un catálogo profesional en proceso de actualización, sin enlaces rotos.

5. **Banner Hero Local:**  
   La imagen del banner se guardará localmente en `renta-boot/src/main/resources/static/images/banner/hero-construction.jpg`, permitiendo al usuario reemplazarla cuando desee por una fotografía propia de su empresa.

---

## 6. Plan de Verificación

1. **Verificación Estática y de Recursos:**
   - Confirmar que la carpeta `renta-boot/src/main/resources/static/images/tools/` y `static/images/banner/` existan y contengan la imagen por defecto `placeholder-tool.svg` y el banner principal.
2. **Verificación Visual en Navegador:**
   - Validar que la vista Home cargue el banner superior, los 4 pilares y la vitrina de destacados sin emojis.
   - Validar que al pulsar "Explorar Catálogo" o las píldoras de navegación se cambie a la vista Catálogo sin recargar la página.
   - Validar que los filtros laterales funcionen dinámicamente sobre las herramientas cargadas.
   - Validar que una herramienta sin imagen muestre el placeholder limpio sin errores en consola.
3. **Verificación de Pruebas Automatizadas:**
   - Ejecutar `mvn clean test` para confirmar que ningún cambio en recursos estáticos afecte las 32+ pruebas unitarias de backend.
