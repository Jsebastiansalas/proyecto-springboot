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
INSERT INTO users (id, email, password_hash, role_id)
SELECT i, 'cliente' || i || '@correo.com', crypt('Password123*', gen_salt('bf', 10)), 3
FROM generate_series(1, 20) i;
INSERT INTO users (id, email, password_hash, role_id)
SELECT i, 'proveedor' || (i - 20) || '@correo.com', crypt('Password123*', gen_salt('bf', 10)), 2
FROM generate_series(21, 40) i;
INSERT INTO users (id, email, password_hash, role_id) VALUES
 (41, 'admin@renta.com', crypt('Admin123*', gen_salt('bf', 10)), 1),
 (42, 'admin2@renta.com', crypt('Admin123*', gen_salt('bf', 10)), 1);

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
 'https://picsum.photos/seed/herramienta' || i || '/800/600'
FROM generate_series(1, 20) i;

-- 7. TOOL_IMAGES (4FN)
INSERT INTO tool_images (tool_id, image_url, is_primary, caption)
SELECT i, 'https://picsum.photos/seed/herramienta' || i || '/1200/800', TRUE, 'Vista frontal del equipo'
FROM generate_series(1, 20) i;

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
INSERT INTO payments (id, transaction_reference, reservation_id, client_id, payment_method, amount, payment_status, payment_date, gateway_reference)
SELECT r.id, 'TXN-' || lpad(r.id::text, 8, '0'), r.id, r.client_id,
 (ARRAY['TARJETA_CREDITO','PSE','TRANSFERENCIA','PASARELA_SIMULADA'])[1 + r.id % 4],
 r.total_amount, 'COMPLETADO', r.start_date::timestamptz - interval '2 days', 'GW-' || (700000 + r.id * 13)
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
