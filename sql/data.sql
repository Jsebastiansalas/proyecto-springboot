-- ============================================================================
-- DATOS DE PRUEBA - Plataforma de Renta de Herramientas (PostgreSQL)
-- Ejecutar DESPUES de schema.sql.
-- 20 registros por tabla (roles: 3 catalogo fijo; users: 42; reservations: 25).
-- Contraseñas (BCrypt via pgcrypto, compatible con Spring Security):
--   admin@renta.com / Admin123*      clientes y proveedores / Password123*
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Limpieza previa (permite re-ejecutar este script)
TRUNCATE damage_reports, rental_returns, rental_deliveries, invoices, payments, reservations,
         tool_safety_requirements, tool_pricing_tiers, tool_specifications, tool_images,
         tools, categories, providers, clients, users, roles RESTART IDENTITY CASCADE;

-- 1. ROLES
INSERT INTO roles (id, name, description) VALUES
 (1, 'ROLE_ADMIN', 'Administrador de la plataforma'),
 (2, 'ROLE_PROVEEDOR', 'Proveedor propietario de herramientas'),
 (3, 'ROLE_CLIENTE', 'Cliente que renta herramientas');

-- 2. USERS: 1-20 clientes, 21-40 proveedores, 41-42 administradores
-- Contraseñas reforzadas de alta entropía con costo BCrypt 12:
--   Admin: Admin#Renta2026!SecOps
--   Proveedores: Proveedor#Renta2026!Sec
--   Clientes: Cliente#Renta2026!Sec
INSERT INTO users (id, email, password_hash, role_id)
SELECT i, 'cliente' || i || '@correo.com', crypt('Cliente#Renta2026!Sec', gen_salt('bf', 12)), 3
FROM generate_series(1, 20) i;
INSERT INTO users (id, email, password_hash, role_id)
SELECT i, 'proveedor' || (i - 20) || '@correo.com', crypt('Proveedor#Renta2026!Sec', gen_salt('bf', 12)), 2
FROM generate_series(21, 40) i;
INSERT INTO users (id, email, password_hash, role_id) VALUES
 (41, 'admin@renta.com', crypt('Admin#Renta2026!SecOps', gen_salt('bf', 12)), 1),
 (42, 'admin2@renta.com', crypt('Admin#Renta2026!SecOps', gen_salt('bf', 12)), 1);

-- 3. CLIENTS
INSERT INTO clients (id, user_id, first_name, last_name, document_type, document_number, phone, address, city)
SELECT i, i,
 (ARRAY['Carlos','María','Andrés','Laura','Juan','Sofía','Diego','Camila','Felipe','Valentina','Santiago','Daniela','Mateo','Paula','Sebastián','Natalia','Julián','Carolina','Esteban','Luisa'])[i],
 (ARRAY['Gómez','Rodríguez','Martínez','López','Hernández','Pérez','Ramírez','Torres','Díaz','Vargas','Castro','Rojas','Moreno','Jiménez','Ortiz','Silva','Mendoza','Cardona','Ruiz','Herrera'])[i],
 CASE WHEN i % 5 = 0 THEN 'NIT' ELSE 'CC' END,
 (1000000000 + i * 7919)::text,
 '300' || (1000000 + i * 4231)::text,
 'Calle ' || (10 + i) || ' # ' || (i + 3) || '-' || (20 + i),
 (ARRAY['Bogotá','Medellín','Cali','Barranquilla','Cartagena'])[1 + i % 5]
FROM generate_series(1, 20) i;

-- 4. PROVIDERS
INSERT INTO providers (id, user_id, company_name, legal_representative, nit_rut, phone, address, city, verified)
SELECT i, i + 20,
 (ARRAY['Ferretools SAS','Maquinaria Andina','ConstruRenta','Equipos del Norte','Herramientas Pro','AndamiosYa','Topografía Total','Ingeniería Móvil','Alquiler Obras','MaxPower Equipos','Concretos y Más','Rentamaq Colombia','Taladros SA','Soldex Ltda','Elevatec','Vibrados del Sur','Compresores Cali','Obra Fácil','Pesados del Caribe','Todo Equipo SAS'])[i],
 (ARRAY['Ricardo Salazar','Gloria Peña','Hernán Cruz','Marta Ospina','Jorge Bernal','Ana Quintero','Luis Pardo','Clara Lozano','Oscar Mejía','Diana Suárez','Camilo Ríos','Patricia Arias','Fabio Montoya','Liliana Duque','Mauricio Vega','Sandra Osorio','Álvaro Cano','Teresa Franco','Gustavo León','Rocío Naranjo'])[i],
 '900' || (100000 + i * 3571)::text || '-' || (i % 9 + 1),
 '601' || (2000000 + i * 3119)::text,
 'Carrera ' || (20 + i) || ' # ' || (i + 40) || '-' || (10 + i),
 (ARRAY['Bogotá','Medellín','Cali','Barranquilla','Cartagena'])[1 + i % 5],
 (i % 4 <> 0)
FROM generate_series(1, 20) i;

-- 5. CATEGORIES
INSERT INTO categories (id, name, description, icon_name)
SELECT i,
 (ARRAY['Taladros y Rotomartillos','Mezcladoras de Concreto','Andamios','Compresores de Aire','Generadores Eléctricos','Sierras y Cortadoras','Equipos de Soldadura','Vibradores de Concreto','Compactadores','Montacargas y Elevadores','Topografía y Medición','Bombas de Agua','Pulidoras y Lijadoras','Hidrolavadoras','Escaleras y Plataformas','Martillos Demoledores','Minicargadores','Herramientas Manuales','Equipos de Pintura','Iluminación de Obra'])[i],
 'Equipos de la categoría ' || (ARRAY['taladros','mezcladoras','andamios','compresores','generadores','sierras','soldadura','vibradores','compactadores','elevación','topografía','bombas','pulido','lavado','escaleras','demolición','carga','manuales','pintura','iluminación'])[i] || ' para obra civil.',
 (ARRAY['drill','mixer','scaffold','air','bolt','saw','flame','wave','layers','lift','map','droplet','sparkles','spray','ladder','hammer','truck','wrench','paint','lightbulb'])[i]
FROM generate_series(1, 20) i;

-- 6. TOOLS
INSERT INTO tools (id, provider_id, category_id, code_sku, name, brand, model, description, base_daily_price, deposit_amount, status, main_image_url)
SELECT i, i, i, 'HERR-' || lpad(i::text, 4, '0'),
 (ARRAY['Rotomartillo SDS Plus','Mezcladora de concreto 350L','Andamio tubular 2m','Compresor 50L','Generador 5.5kW','Sierra circular 7 1/4','Soldador inversor 200A','Vibrador de concreto 2HP','Compactador tipo rana','Elevador de carga 500kg','Estación total','Motobomba 3 pulgadas','Pulidora angular 9"','Hidrolavadora 3000 PSI','Escalera telescópica 5m','Martillo demoledor 30kg','Minicargador Bobcat','Kit herramientas manuales','Pistola airless','Torre de luz LED'])[i],
 (ARRAY['Bosch','Truper','Layher','Ingersoll Rand','Honda','DeWalt','Lincoln','Wacker','Mikasa','Genie','Leica','Pedrollo','Makita','Karcher','Werner','Hilti','Bobcat','Stanley','Graco','Generac'])[i],
 'MOD-' || (100 + i * 7),
 'Equipo en excelente estado, mantenimiento al día, apto para uso profesional en obra.',
 (ARRAY[45000,120000,18000,65000,150000,40000,70000,55000,140000,260000,350000,85000,38000,60000,30000,110000,480000,25000,75000,95000])[i]::numeric,
 (ARRAY[150000,400000,80000,250000,500000,150000,250000,200000,450000,800000,1200000,300000,120000,200000,100000,350000,1500000,80000,250000,300000])[i]::numeric,
 CASE WHEN i IN (9, 17) THEN 'MANTENIMIENTO' ELSE 'DISPONIBLE' END,
 (ARRAY[
   'images/tools/HERR-0001.jpg',
   'images/tools/HERR-0002.jpg',
   'images/tools/HERR-0003.jpg',
   'images/tools/HERR-0004.jpg',
   'images/tools/HERR-0005.webp',
   'images/tools/HERR-0006.jpg',
   'images/tools/HERR-0007.webp',
   'images/tools/HERR-0008.webp',
   'images/tools/HERR-0009.jpg',
   'images/tools/HERR-0010.jpg',
   'images/tools/HERR-0011.jpg',
   'images/tools/HERR-0012.jpg',
   'images/tools/HERR-0013.webp',
   'images/tools/HERR-0014.jpg',
   'images/tools/HERR-0015.jpg',
   'images/tools/HERR-0016.jpg',
   'images/tools/HERR-0017.jpg',
   'images/tools/HERR-0018.webp',
   'images/tools/HERR-0019.jpg',
   'images/tools/HERR-0020.jpg'
  ])[i]
FROM generate_series(1, 20) i;

-- 7. TOOL_IMAGES (4FN)
INSERT INTO tool_images (tool_id, image_url, is_primary, caption)
SELECT id, main_image_url, TRUE, 'Vista principal del equipo' FROM tools;

-- Imágenes adicionales de inspección visual (4FN)
INSERT INTO tool_images (tool_id, image_url, is_primary, caption) VALUES
(1, 'images/tools/taladro-percutor.webp', FALSE, 'Vista en operación con broca SDS'),
(3, 'images/tools/HERR-0003.png', FALSE, 'Detalle de estructura y crucetas'),
(11, 'images/tools/HERR-0011.png', FALSE, 'Vista en trípode de precisión'),
(14, 'images/tools/HERR-0014.png', FALSE, 'Vista de manguera y lanza');

-- 8. TOOL_SPECIFICATIONS (4FN)
INSERT INTO tool_specifications (tool_id, spec_name, spec_value)
SELECT i, 'Potencia / Capacidad', (ARRAY['800 W','350 L','2 m x 1.2 m','2.5 HP','5.5 kW','1800 W','200 A','2 HP','5 HP','500 kg','Precisión 2"','3 HP','2200 W','3000 PSI','5 m','30 kg','1.2 ton','120 piezas','0.6 GPM','4 x 100 W'])[i]
FROM generate_series(1, 20) i;

-- 9. TOOL_PRICING_TIERS (4FN)
INSERT INTO tool_pricing_tiers (tool_id, tier_type, min_days, price_per_day)
SELECT id, 'SEMANAL', 7, round(base_daily_price * 0.85, 2) FROM tools;

-- 10. TOOL_SAFETY_REQUIREMENTS (4FN)
INSERT INTO tool_safety_requirements (tool_id, requirement_name, description)
SELECT i, (ARRAY['Gafas y guantes','Casco y botas','Arnés de seguridad','Protección auditiva','Extintor cercano','Gafas de corte','Careta de soldador','Guantes dieléctricos','Botas punta de acero','Capacitación previa','Trípode certificado','Conexión a tierra','Mascarilla','Gafas y botas','Línea de vida','Protección auditiva y casco','Licencia de operación','Guantes de cuero','Respirador','Señalización perimetral'])[i],
 'Uso obligatorio para operar este equipo conforme a la normativa de seguridad en obra.'
FROM generate_series(1, 20) i;

-- 11. RESERVATIONS
-- 1-20: finalizadas (tool i, client i, ene-jul 2026, 5 días). 21-25: estados variados (nov-dic 2026).
INSERT INTO reservations (id, reservation_code, client_id, tool_id, start_date, end_date, total_days, subtotal, deposit_total, total_amount, status, notes)
SELECT i, 'RES-2026-' || lpad(i::text, 4, '0'), i, i,
 DATE '2026-01-05' + i * 10, DATE '2026-01-05' + i * 10 + 4, 5,
 t.base_daily_price * 5, t.deposit_amount, t.base_daily_price * 5 + t.deposit_amount,
 'FINALIZADA', 'Alquiler para obra residencial'
FROM generate_series(1, 20) i JOIN tools t ON t.id = i;
INSERT INTO reservations (id, reservation_code, client_id, tool_id, start_date, end_date, total_days, subtotal, deposit_total, total_amount, status, notes)
SELECT 20 + n, 'RES-2026-' || lpad((20 + n)::text, 4, '0'), n, n,
 DATE '2026-11-01' + n * 7, DATE '2026-11-01' + n * 7 + 2, 3,
 t.base_daily_price * 3, t.deposit_amount, t.base_daily_price * 3 + t.deposit_amount,
 (ARRAY['PENDIENTE','APROBADA','CANCELADA','PENDIENTE','RECHAZADA'])[n], 'Reserva futura'
FROM generate_series(1, 5) n JOIN tools t ON t.id = n;

-- 12. PAYMENTS (reservas 1-20)
INSERT INTO payments (id, transaction_reference, reservation_id, client_id, payment_method, amount, payment_status, payment_date, gateway_reference, installment_count, paid_installments, monthly_interest_rate)
SELECT r.id, 'TXN-' || lpad(r.id::text, 8, '0'), r.id, r.client_id,
 (ARRAY['TARJETA_CREDITO','PSE','TRANSFERENCIA','PASARELA_SIMULADA'])[1 + r.id % 4],
 r.total_amount,
 CASE WHEN r.id IN (5, 10) THEN 'EN_CUOTAS' ELSE 'COMPLETADO' END,
 r.start_date::timestamptz - interval '2 days', 'GW-' || (700000 + r.id * 13),
 CASE WHEN r.id IN (5, 10) THEN 3 ELSE 1 END,
 1,
 0.00
FROM reservations r WHERE r.id <= 20;

-- 13. INVOICES (IVA 19% sobre el subtotal)
INSERT INTO invoices (id, invoice_number, reservation_id, payment_id, issue_date, subtotal, tax_amount, total, status, pdf_url)
SELECT r.id, 'FAC-2026-' || lpad(r.id::text, 6, '0'), r.id, r.id, r.start_date::timestamptz - interval '2 days',
 r.subtotal, round(r.subtotal * 0.19, 2), r.subtotal + round(r.subtotal * 0.19, 2), 'EMITIDA',
 '/api/v1/invoices/' || r.id || '/pdf'
FROM reservations r WHERE r.id <= 20;

-- 14. RENTAL_DELIVERIES
INSERT INTO rental_deliveries (reservation_id, delivery_date, delivered_by, initial_condition_notes, client_signature_ack)
SELECT r.id, r.start_date::timestamptz + interval '8 hours', p.legal_representative,
 'Equipo entregado limpio, funcional y con accesorios completos.', TRUE
FROM reservations r JOIN tools t ON t.id = r.tool_id JOIN providers p ON p.id = t.provider_id
WHERE r.id <= 20;

-- 15. RENTAL_RETURNS (daños en 16-20)
INSERT INTO rental_returns (id, reservation_id, return_date, received_by, tool_condition_status, inspection_notes, deposit_refunded, extra_damage_fee)
SELECT r.id, r.id, r.end_date::timestamptz + interval '17 hours', p.legal_representative,
 CASE WHEN r.id <= 10 THEN 'EXCELENTE' WHEN r.id <= 15 THEN 'BUENO' ELSE 'DANADO' END,
 CASE WHEN r.id <= 15 THEN 'Devuelto sin novedades.' ELSE 'Se detectan daños durante la inspección.' END,
 (r.id <= 15),
 CASE WHEN r.id <= 15 THEN 0 ELSE 20000 * (r.id - 15) END
FROM reservations r JOIN tools t ON t.id = r.tool_id JOIN providers p ON p.id = t.provider_id
WHERE r.id <= 20;

-- 16. DAMAGE_REPORTS (20 reportes: 15 observaciones menores + 5 daños relevantes)
INSERT INTO damage_reports (return_id, reported_by, damage_type, description, repair_cost_estimate, status)
SELECT rr.id, p.legal_representative,
 (ARRAY['DESGASTE_EXCESIVO','ACCESORIO_FALTANTE','ESTRUCTURA','MOTOR'])[1 + rr.id % 4],
 CASE WHEN rr.id <= 15 THEN 'Desgaste normal por uso, sin costo adicional.' ELSE 'Daño detectado en la devolución, requiere reparación.' END,
 CASE WHEN rr.id <= 15 THEN 0 ELSE rr.extra_damage_fee END,
 CASE WHEN rr.id <= 15 THEN 'CONDONADO' ELSE 'COBRADO' END
FROM rental_returns rr JOIN reservations r ON r.id = rr.reservation_id
JOIN tools t ON t.id = r.tool_id JOIN providers p ON p.id = t.provider_id;

-- Sincronizar secuencias tras insertar IDs explícitos
SELECT setval(pg_get_serial_sequence('roles', 'id'), (SELECT max(id) FROM roles));
SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT max(id) FROM users));
SELECT setval(pg_get_serial_sequence('clients', 'id'), (SELECT max(id) FROM clients));
SELECT setval(pg_get_serial_sequence('providers', 'id'), (SELECT max(id) FROM providers));
SELECT setval(pg_get_serial_sequence('categories', 'id'), (SELECT max(id) FROM categories));
SELECT setval(pg_get_serial_sequence('tools', 'id'), (SELECT max(id) FROM tools));
SELECT setval(pg_get_serial_sequence('reservations', 'id'), (SELECT max(id) FROM reservations));
SELECT setval(pg_get_serial_sequence('payments', 'id'), (SELECT max(id) FROM payments));
SELECT setval(pg_get_serial_sequence('invoices', 'id'), (SELECT max(id) FROM invoices));
SELECT setval(pg_get_serial_sequence('rental_returns', 'id'), (SELECT max(id) FROM rental_returns));

-- 17. REVIEWS (Opiniones iniciales de clientes tras alquileres completados)
INSERT INTO reviews (tool_id, client_id, reservation_id, rating, comment) VALUES
(1, 1, 1, 5, 'Excelente rotomartillo, perforó concreto sin problema y ahorró mucho tiempo en obra.'),
(2, 2, 2, 4, 'La vibrocompactadora funcionó muy bien, motor potente y fácil de arrancar.'),
(3, 3, 3, 5, 'Cortadora de pavimento de alta precisión, disco diamantado en excelente estado.')
ON CONFLICT (reservation_id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('reviews', 'id'), COALESCE((SELECT max(id) FROM reviews), 1));


-- 18. PAYMENT_INSTALLMENTS (Cronograma de cuotas para pagos existentes)
-- Para pagos de 1 cuota (todos excepto 5 y 10)
INSERT INTO payment_installments (payment_id, reservation_id, installment_number, total_installments, due_date, principal_amount, interest_amount, total_installment_amount, status, paid_at, transaction_ref)
SELECT p.id, p.reservation_id, 1, 1, p.payment_date::date, p.amount, 0.00, p.amount, 'PAGADA', p.payment_date, p.transaction_reference || '-C1'
FROM payments p WHERE p.id NOT IN (5, 10);

-- Para pago 5 (3 cuotas: Cuota 1 pagada, Cuotas 2 y 3 pendientes)
INSERT INTO payment_installments (payment_id, reservation_id, installment_number, total_installments, due_date, principal_amount, interest_amount, total_installment_amount, status, paid_at, transaction_ref)
SELECT 5, 5, 1, 3, p.payment_date::date, round(p.amount / 3, 2), 0.00, round(p.amount / 3, 2), 'PAGADA', p.payment_date, p.transaction_reference || '-C1'
FROM payments p WHERE p.id = 5
UNION ALL
SELECT 5, 5, 2, 3, p.payment_date::date + interval '30 days', round(p.amount / 3, 2), 0.00, round(p.amount / 3, 2), 'PENDIENTE', NULL, NULL
FROM payments p WHERE p.id = 5
UNION ALL
SELECT 5, 5, 3, 3, p.payment_date::date + interval '60 days', round(p.amount / 3, 2), 0.00, round(p.amount / 3, 2), 'PENDIENTE', NULL, NULL
FROM payments p WHERE p.id = 5;

-- Para pago 10 (3 cuotas: Cuota 1 pagada, Cuotas 2 y 3 pendientes)
INSERT INTO payment_installments (payment_id, reservation_id, installment_number, total_installments, due_date, principal_amount, interest_amount, total_installment_amount, status, paid_at, transaction_ref)
SELECT 10, 10, 1, 3, p.payment_date::date, round(p.amount / 3, 2), 0.00, round(p.amount / 3, 2), 'PAGADA', p.payment_date, p.transaction_reference || '-C1'
FROM payments p WHERE p.id = 10
UNION ALL
SELECT 10, 10, 2, 3, p.payment_date::date + interval '30 days', round(p.amount / 3, 2), 0.00, round(p.amount / 3, 2), 'PENDIENTE', NULL, NULL
FROM payments p WHERE p.id = 10
UNION ALL
SELECT 10, 10, 3, 3, p.payment_date::date + interval '60 days', round(p.amount / 3, 2), 0.00, round(p.amount / 3, 2), 'PENDIENTE', NULL, NULL
FROM payments p WHERE p.id = 10;

-- 19. TOOL_COMMENTS (20 preguntas y comentarios técnicos con respuestas oficiales de proveedores)
INSERT INTO tool_comments (tool_id, user_id, author_name, author_role, comment_text, provider_reply, replied_at) VALUES
(1, 1, 'Carlos Mendoza', 'CLIENTE', '¿El rotomartillo incluye el juego de brocas SDS Plus o se alquilan aparte?', 'Buen día Carlos. Incluye juego de 3 brocas estándar para concreto (1/2, 5/8 y 3/4 pulgada) listas para faena.', NOW() - interval '5 days'),
(1, 2, 'Constructora Bolívar SAS', 'CLIENTE', '¿Requiere toma eléctrica de 220V o funciona en 110V estándar de obra?', 'Funciona a 110V estándar con motor de 1.500W de alto rendimiento y doble aislamiento.', NOW() - interval '4 days'),
(2, 3, 'Ing. Roberto Silva', 'CLIENTE', '¿Qué tipo de combustible utiliza la vibrocompactadora y cuánta capacidad tiene el tanque?', 'Utiliza gasolina corriente con motor Honda GX160 de 4 tiempos. Capacidad de 3.6 litros.', NOW() - interval '6 days'),
(2, 4, 'Urbanizaciones del Norte', 'CLIENTE', '¿Viene calibrada para compactación de sub-base granular en parqueaderos?', 'Correcto, cuenta con impacto de 13 kN ideal para zanjas y bases granulares.', NOW() - interval '3 days'),
(3, 5, 'Consorcio Vial 2026', 'CLIENTE', '¿La cortadora de pavimento incluye disco diamantado para concreto verde o asfalto?', 'Incluye disco diamantado de 14 pulgadas apto para corte de pavimento asfáltico y concreto curado.', NOW() - interval '2 days'),
(4, 1, 'Carlos Mendoza', 'CLIENTE', '¿La torre de iluminación es remolcable con tiro estándar de camioneta?', 'Sí, cuenta con tiro de bola de 2 pulgadas, luces reglamentarias de carretera y suspensión reforzada.', NOW() - interval '7 days'),
(4, 2, 'Constructora Bolívar SAS', 'CLIENTE', '¿Cuántas horas de autonomía continua brinda con el tanque lleno?', 'Tiene tanque diésel de 100 litros que rinde 60 horas continuas de operación con sus 4 lámparas LED.', NOW() - interval '5 days'),
(5, 3, 'Ing. Roberto Silva', 'CLIENTE', '¿El generador de 10 kVA tiene salida trifásica o solo monofásica?', 'Cuenta con salidas bifásicas de 120/240V y breaker industrial independiente para faenas de construcción.', NOW() - interval '3 days'),
(6, 4, 'Urbanizaciones del Norte', 'CLIENTE', '¿El compresor neumático tiene acoples rápidos tipo Chicago?', 'Afirmativo, incluye 2 acoples de garra tipo Chicago con manguera de alta presión de 15 metros.', NOW() - interval '4 days'),
(7, 5, 'Consorcio Vial 2026', 'CLIENTE', '¿El martillo demoledor de 30 kg incluye cincel de punta y pala ancha?', 'Incluye 1 puntero y 1 cincel plano con encastre hexagonal de 28 mm certificados.', NOW() - interval '1 day'),
(8, 1, 'Carlos Mendoza', 'CLIENTE', '¿Cuál es la altura máxima de trabajo de la plataforma de tijera?', 'Alcanza una altura de trabajo de 10 metros con capacidad de carga de 230 kg en canastilla.', NOW() - interval '8 days'),
(9, 2, 'Constructora Bolívar SAS', 'CLIENTE', '¿La motobomba para lodos soporta sólidos en suspensión?', 'Soporta sólidos de hasta 2 pulgadas de diámetro con cuerpo de bomba autocebante de alta resistencia.', NOW() - interval '2 days'),
(10, 3, 'Ing. Roberto Silva', 'CLIENTE', '¿La allanadora de concreto incluye el plato de flotación?', 'Viene equipada con 4 aspas combinadas y plato flotador de 36 pulgadas para acabado pulido.', NOW() - interval '4 days'),
(11, 4, 'Urbanizaciones del Norte', 'CLIENTE', '¿El andamio certificado incluye rodapiés y barandas de seguridad?', 'Viene con cuerpo completo de 2 secciones, plataforma metálica antideslizante, rodapiés y baranda perimetral.', NOW() - interval '6 days'),
(12, 5, 'Consorcio Vial 2026', 'CLIENTE', '¿La soldadora inverter requiere acometida industrial?', 'Funciona con corriente 110V/220V bi-voltaje automática, perfecta para talleres móviles o conexiones de obra.', NOW() - interval '1 day'),
(13, 1, 'Carlos Mendoza', 'CLIENTE', '¿El rotomartillo inalámbrico incluye 2 baterías y cargador rápido?', 'Incluye 2 baterías de litio de 18V / 5.0Ah y cargador rápido de 45 minutos.', NOW() - interval '9 days'),
(14, 2, 'Constructora Bolívar SAS', 'CLIENTE', '¿La hidrolavadora industrial es de motor a gasolina o eléctrica?', 'Es motor a gasolina de 6.5 HP con presión de trabajo de 3.200 PSI para lavado pesado de maquinaria.', NOW() - interval '3 days'),
(15, 3, 'Ing. Roberto Silva', 'CLIENTE', '¿La zanjadora compacta tiene orugas de goma para no maltratar césped?', 'Correcto, cuenta con orugas de caucho de baja presión que no dañan áreas verdes o adoquines.', NOW() - interval '5 days'),
(16, 4, 'Urbanizaciones del Norte', 'CLIENTE', '¿La sierra ingletadora telescópica tiene guía láser?', 'Sí, incorpora guía láser de precisión y disco de carburo de 80 dientes para corte limpio de perfiles.', NOW() - interval '2 days'),
(17, 5, 'Consorcio Vial 2026', 'CLIENTE', '¿El rodillo compactador doble rodillo es de operador a pie o sentado?', 'Es tipo hombre a bordo (operador sentado) con tracción y vibración en ambos tambores.', NOW() - interval '1 day');

SELECT setval(pg_get_serial_sequence('payment_installments', 'id'), COALESCE((SELECT max(id) FROM payment_installments), 1));
SELECT setval(pg_get_serial_sequence('tool_comments', 'id'), COALESCE((SELECT max(id) FROM tool_comments), 1));
