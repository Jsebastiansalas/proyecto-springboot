-- ============================================================================
-- DATOS DE PRUEBA - Plataforma de Renta de Herramientas (MySQL 8.0+)
-- Al menos 20 registros por entidad funcional.
-- Contraseñas encriptadas con BCrypt (costo 12):
--   Admin: Admin#Renta2026!SecOps
--   Proveedores: Proveedor#Renta2026!Sec
--   Clientes: Cliente#Renta2026!Sec
-- ============================================================================

USE renta_db;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. ROLES
INSERT INTO roles (id, name, description) VALUES
 (1, 'ROLE_ADMIN', 'Administrador con acceso total al sistema'),
 (2, 'ROLE_PROVEEDOR', 'Proveedor y dueno de flota de herramientas'),
 (3, 'ROLE_CLIENTE', 'Cliente contratista o particular que alquila equipos');

-- 2. USERS (20 clientes, 20 proveedores, 2 administradores = 42 usuarios)
INSERT INTO users (id, email, password_hash, role_id, is_active, created_at, updated_at) VALUES
 (1, 'cliente1@correo.com', '$2a$12$m4AeHc1N0amcuhcULFTte.AAXG.y2TBy17vSMdcVAAngzY3ZI3LrC', 3, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (2, 'cliente2@correo.com', '$2a$12$m4AeHc1N0amcuhcULFTte.AAXG.y2TBy17vSMdcVAAngzY3ZI3LrC', 3, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (3, 'cliente3@correo.com', '$2a$12$m4AeHc1N0amcuhcULFTte.AAXG.y2TBy17vSMdcVAAngzY3ZI3LrC', 3, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (4, 'cliente4@correo.com', '$2a$12$m4AeHc1N0amcuhcULFTte.AAXG.y2TBy17vSMdcVAAngzY3ZI3LrC', 3, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (5, 'cliente5@correo.com', '$2a$12$m4AeHc1N0amcuhcULFTte.AAXG.y2TBy17vSMdcVAAngzY3ZI3LrC', 3, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (6, 'cliente6@correo.com', '$2a$12$m4AeHc1N0amcuhcULFTte.AAXG.y2TBy17vSMdcVAAngzY3ZI3LrC', 3, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (7, 'cliente7@correo.com', '$2a$12$m4AeHc1N0amcuhcULFTte.AAXG.y2TBy17vSMdcVAAngzY3ZI3LrC', 3, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (8, 'cliente8@correo.com', '$2a$12$m4AeHc1N0amcuhcULFTte.AAXG.y2TBy17vSMdcVAAngzY3ZI3LrC', 3, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (9, 'cliente9@correo.com', '$2a$12$m4AeHc1N0amcuhcULFTte.AAXG.y2TBy17vSMdcVAAngzY3ZI3LrC', 3, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (10, 'cliente10@correo.com', '$2a$12$m4AeHc1N0amcuhcULFTte.AAXG.y2TBy17vSMdcVAAngzY3ZI3LrC', 3, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (11, 'cliente11@correo.com', '$2a$12$m4AeHc1N0amcuhcULFTte.AAXG.y2TBy17vSMdcVAAngzY3ZI3LrC', 3, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (12, 'cliente12@correo.com', '$2a$12$m4AeHc1N0amcuhcULFTte.AAXG.y2TBy17vSMdcVAAngzY3ZI3LrC', 3, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (13, 'cliente13@correo.com', '$2a$12$m4AeHc1N0amcuhcULFTte.AAXG.y2TBy17vSMdcVAAngzY3ZI3LrC', 3, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (14, 'cliente14@correo.com', '$2a$12$m4AeHc1N0amcuhcULFTte.AAXG.y2TBy17vSMdcVAAngzY3ZI3LrC', 3, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (15, 'cliente15@correo.com', '$2a$12$m4AeHc1N0amcuhcULFTte.AAXG.y2TBy17vSMdcVAAngzY3ZI3LrC', 3, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (16, 'cliente16@correo.com', '$2a$12$m4AeHc1N0amcuhcULFTte.AAXG.y2TBy17vSMdcVAAngzY3ZI3LrC', 3, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (17, 'cliente17@correo.com', '$2a$12$m4AeHc1N0amcuhcULFTte.AAXG.y2TBy17vSMdcVAAngzY3ZI3LrC', 3, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (18, 'cliente18@correo.com', '$2a$12$m4AeHc1N0amcuhcULFTte.AAXG.y2TBy17vSMdcVAAngzY3ZI3LrC', 3, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (19, 'cliente19@correo.com', '$2a$12$m4AeHc1N0amcuhcULFTte.AAXG.y2TBy17vSMdcVAAngzY3ZI3LrC', 3, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (20, 'cliente20@correo.com', '$2a$12$m4AeHc1N0amcuhcULFTte.AAXG.y2TBy17vSMdcVAAngzY3ZI3LrC', 3, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (21, 'proveedor1@correo.com', '$2a$12$5NxhSQeqDTN42OzFLyqyX.SAG44kdU8V26QJwz/43pAerzBZKKLxa', 2, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (22, 'proveedor2@correo.com', '$2a$12$5NxhSQeqDTN42OzFLyqyX.SAG44kdU8V26QJwz/43pAerzBZKKLxa', 2, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (23, 'proveedor3@correo.com', '$2a$12$5NxhSQeqDTN42OzFLyqyX.SAG44kdU8V26QJwz/43pAerzBZKKLxa', 2, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (24, 'proveedor4@correo.com', '$2a$12$5NxhSQeqDTN42OzFLyqyX.SAG44kdU8V26QJwz/43pAerzBZKKLxa', 2, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (25, 'proveedor5@correo.com', '$2a$12$5NxhSQeqDTN42OzFLyqyX.SAG44kdU8V26QJwz/43pAerzBZKKLxa', 2, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (26, 'proveedor6@correo.com', '$2a$12$5NxhSQeqDTN42OzFLyqyX.SAG44kdU8V26QJwz/43pAerzBZKKLxa', 2, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (27, 'proveedor7@correo.com', '$2a$12$5NxhSQeqDTN42OzFLyqyX.SAG44kdU8V26QJwz/43pAerzBZKKLxa', 2, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (28, 'proveedor8@correo.com', '$2a$12$5NxhSQeqDTN42OzFLyqyX.SAG44kdU8V26QJwz/43pAerzBZKKLxa', 2, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (29, 'proveedor9@correo.com', '$2a$12$5NxhSQeqDTN42OzFLyqyX.SAG44kdU8V26QJwz/43pAerzBZKKLxa', 2, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (30, 'proveedor10@correo.com', '$2a$12$5NxhSQeqDTN42OzFLyqyX.SAG44kdU8V26QJwz/43pAerzBZKKLxa', 2, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (31, 'proveedor11@correo.com', '$2a$12$5NxhSQeqDTN42OzFLyqyX.SAG44kdU8V26QJwz/43pAerzBZKKLxa', 2, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (32, 'proveedor12@correo.com', '$2a$12$5NxhSQeqDTN42OzFLyqyX.SAG44kdU8V26QJwz/43pAerzBZKKLxa', 2, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (33, 'proveedor13@correo.com', '$2a$12$5NxhSQeqDTN42OzFLyqyX.SAG44kdU8V26QJwz/43pAerzBZKKLxa', 2, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (34, 'proveedor14@correo.com', '$2a$12$5NxhSQeqDTN42OzFLyqyX.SAG44kdU8V26QJwz/43pAerzBZKKLxa', 2, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (35, 'proveedor15@correo.com', '$2a$12$5NxhSQeqDTN42OzFLyqyX.SAG44kdU8V26QJwz/43pAerzBZKKLxa', 2, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (36, 'proveedor16@correo.com', '$2a$12$5NxhSQeqDTN42OzFLyqyX.SAG44kdU8V26QJwz/43pAerzBZKKLxa', 2, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (37, 'proveedor17@correo.com', '$2a$12$5NxhSQeqDTN42OzFLyqyX.SAG44kdU8V26QJwz/43pAerzBZKKLxa', 2, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (38, 'proveedor18@correo.com', '$2a$12$5NxhSQeqDTN42OzFLyqyX.SAG44kdU8V26QJwz/43pAerzBZKKLxa', 2, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (39, 'proveedor19@correo.com', '$2a$12$5NxhSQeqDTN42OzFLyqyX.SAG44kdU8V26QJwz/43pAerzBZKKLxa', 2, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (40, 'proveedor20@correo.com', '$2a$12$5NxhSQeqDTN42OzFLyqyX.SAG44kdU8V26QJwz/43pAerzBZKKLxa', 2, 1, '2026-01-10 08:00:00', '2026-01-10 08:00:00'),
 (41, 'admin@renta.com', '$2a$12$Gx5ueMVKWfEk0mORaQjkX.aOAjnScNsajFUFDluPBELHr6ry8Lm1G', 1, 1, '2026-01-01 00:00:00', '2026-01-01 00:00:00'),
 (42, 'admin2@renta.com', '$2a$12$Gx5ueMVKWfEk0mORaQjkX.aOAjnScNsajFUFDluPBELHr6ry8Lm1G', 1, 1, '2026-01-01 00:00:00', '2026-01-01 00:00:00');

-- 3. CLIENTS (20 clientes)
INSERT INTO clients (id, user_id, first_name, last_name, document_type, document_number, phone, address, city, created_at) VALUES
 (1, 1, 'Carlos', 'Gomez', 'CC', '1000007919', '3001004231', 'Calle 11 # 4-21', 'Bogota', '2026-01-10 09:00:00'),
 (2, 2, 'Maria', 'Rodriguez', 'CC', '1000015838', '3001008462', 'Calle 12 # 5-22', 'Medellin', '2026-01-10 09:00:00'),
 (3, 3, 'Andres', 'Martinez', 'CC', '1000023757', '3001012693', 'Calle 13 # 6-23', 'Cali', '2026-01-10 09:00:00'),
 (4, 4, 'Laura', 'Lopez', 'CC', '1000031676', '3001016924', 'Calle 14 # 7-24', 'Barranquilla', '2026-01-10 09:00:00'),
 (5, 5, 'Juan', 'Hernandez', 'NIT', '1000039595', '3001021155', 'Calle 15 # 8-25', 'Cartagena', '2026-01-10 09:00:00'),
 (6, 6, 'Sofia', 'Perez', 'CC', '1000047514', '3001025386', 'Calle 16 # 9-26', 'Bogota', '2026-01-10 09:00:00'),
 (7, 7, 'Diego', 'Ramirez', 'CC', '1000055433', '3001029617', 'Calle 17 # 10-27', 'Medellin', '2026-01-10 09:00:00'),
 (8, 8, 'Camila', 'Torres', 'CC', '1000063352', '3001033848', 'Calle 18 # 11-28', 'Cali', '2026-01-10 09:00:00'),
 (9, 9, 'Felipe', 'Diaz', 'CC', '1000071271', '3001038079', 'Calle 19 # 12-29', 'Barranquilla', '2026-01-10 09:00:00'),
 (10, 10, 'Valentina', 'Vargas', 'NIT', '1000079190', '3001042310', 'Calle 20 # 13-30', 'Cartagena', '2026-01-10 09:00:00'),
 (11, 11, 'Santiago', 'Castro', 'CC', '1000087109', '3001046541', 'Calle 21 # 14-31', 'Bogota', '2026-01-10 09:00:00'),
 (12, 12, 'Daniela', 'Rojas', 'CC', '1000095028', '3001050772', 'Calle 22 # 15-32', 'Medellin', '2026-01-10 09:00:00'),
 (13, 13, 'Mateo', 'Moreno', 'CC', '1000102947', '3001055003', 'Calle 23 # 16-33', 'Cali', '2026-01-10 09:00:00'),
 (14, 14, 'Paula', 'Jimenez', 'CC', '1000110866', '3001059234', 'Calle 24 # 17-34', 'Barranquilla', '2026-01-10 09:00:00'),
 (15, 15, 'Sebastian', 'Ortiz', 'NIT', '1000118785', '3001063465', 'Calle 25 # 18-35', 'Cartagena', '2026-01-10 09:00:00'),
 (16, 16, 'Natalia', 'Silva', 'CC', '1000126704', '3001067696', 'Calle 26 # 19-36', 'Bogota', '2026-01-10 09:00:00'),
 (17, 17, 'Julian', 'Mendoza', 'CC', '1000134623', '3001071927', 'Calle 27 # 20-37', 'Medellin', '2026-01-10 09:00:00'),
 (18, 18, 'Carolina', 'Cardona', 'CC', '1000142542', '3001076158', 'Calle 28 # 21-38', 'Cali', '2026-01-10 09:00:00'),
 (19, 19, 'Esteban', 'Ruiz', 'CC', '1000150461', '3001080389', 'Calle 29 # 22-39', 'Barranquilla', '2026-01-10 09:00:00'),
 (20, 20, 'Luisa', 'Herrera', 'NIT', '1000158380', '3001084620', 'Calle 30 # 23-40', 'Cartagena', '2026-01-10 09:00:00');

-- 4. PROVIDERS (20 proveedores)
INSERT INTO providers (id, user_id, company_name, legal_representative, nit_rut, phone, address, city, verified, created_at) VALUES
 (1, 21, 'Ferretools SAS', 'Ricardo Salazar', '900103571-2', '6012003119', 'Carrera 21 # 41-11', 'Bogota', 1, '2026-01-10 09:30:00'),
 (2, 22, 'Maquinaria Andina', 'Gloria Pena', '900107142-3', '6012006238', 'Carrera 22 # 42-12', 'Medellin', 1, '2026-01-10 09:30:00'),
 (3, 23, 'ConstruRenta', 'Hernan Cruz', '900110713-4', '6012009357', 'Carrera 23 # 43-13', 'Cali', 1, '2026-01-10 09:30:00'),
 (4, 24, 'Equipos del Norte', 'Marta Ospina', '900114284-5', '6012012476', 'Carrera 24 # 44-14', 'Barranquilla', 0, '2026-01-10 09:30:00'),
 (5, 25, 'Herramientas Pro', 'Jorge Bernal', '900117855-6', '6012015595', 'Carrera 25 # 45-15', 'Cartagena', 1, '2026-01-10 09:30:00'),
 (6, 26, 'AndamiosYa', 'Ana Quintero', '900121426-7', '6012018714', 'Carrera 26 # 46-16', 'Bogota', 1, '2026-01-10 09:30:00'),
 (7, 27, 'Topografia Total', 'Luis Pardo', '900124997-8', '6012021833', 'Carrera 27 # 47-17', 'Medellin', 1, '2026-01-10 09:30:00'),
 (8, 28, 'Ingenieria Movil', 'Clara Lozano', '900128568-9', '6012024952', 'Carrera 28 # 48-18', 'Cali', 0, '2026-01-10 09:30:00'),
 (9, 29, 'Alquiler Obras', 'Oscar Mejia', '900132139-1', '6012028071', 'Carrera 29 # 49-19', 'Barranquilla', 1, '2026-01-10 09:30:00'),
 (10, 30, 'MaxPower Equipos', 'Diana Suarez', '900135710-2', '6012031190', 'Carrera 30 # 50-20', 'Cartagena', 1, '2026-01-10 09:30:00'),
 (11, 31, 'Concretos y Mas', 'Camilo Rios', '900139281-3', '6012034309', 'Carrera 31 # 51-21', 'Bogota', 1, '2026-01-10 09:30:00'),
 (12, 32, 'Rentamaq Colombia', 'Patricia Arias', '900142852-4', '6012037428', 'Carrera 32 # 52-22', 'Medellin', 0, '2026-01-10 09:30:00'),
 (13, 33, 'Taladros SA', 'Fabio Montoya', '900146423-5', '6012040547', 'Carrera 33 # 53-23', 'Cali', 1, '2026-01-10 09:30:00'),
 (14, 34, 'Soldex Ltda', 'Liliana Duque', '900149994-6', '6012043666', 'Carrera 34 # 54-24', 'Barranquilla', 1, '2026-01-10 09:30:00'),
 (15, 35, 'Elevatec', 'Mauricio Vega', '900153565-7', '6012046785', 'Carrera 35 # 55-25', 'Cartagena', 1, '2026-01-10 09:30:00'),
 (16, 36, 'Vibrados del Sur', 'Sandra Osorio', '900157136-8', '6012049904', 'Carrera 36 # 56-26', 'Bogota', 0, '2026-01-10 09:30:00'),
 (17, 37, 'Compresores Cali', 'Alvaro Cano', '900160707-9', '6012053023', 'Carrera 37 # 57-27', 'Medellin', 1, '2026-01-10 09:30:00'),
 (18, 38, 'Obra Facil', 'Teresa Franco', '900164278-1', '6012056142', 'Carrera 38 # 58-28', 'Cali', 1, '2026-01-10 09:30:00'),
 (19, 39, 'Pesados del Caribe', 'Gustavo Leon', '900167849-2', '6012059261', 'Carrera 39 # 59-29', 'Barranquilla', 1, '2026-01-10 09:30:00'),
 (20, 40, 'Todo Equipo SAS', 'Rocio Naranjo', '900171420-3', '6012062380', 'Carrera 40 # 60-30', 'Cartagena', 0, '2026-01-10 09:30:00');

-- 5. CATEGORIES (6 categorias)
INSERT INTO categories (id, name, description, icon_name, active) VALUES
 (1, 'Maquinaria Pesada', 'Excavadoras, retroexcavadoras, cargadores y rodillos', 'truck', 1),
 (2, 'Compactacion y Pavimentacion', 'Vibrocompactadores, apisonadores canguro y placas', 'layers', 1),
 (3, 'Corte y Perforacion', 'Martillos demoledores, taladros percutores y cortadoras', 'scissors', 1),
 (4, 'Generacion y Bombeo', 'Generadores electricos, motobombas y torres de luz', 'zap', 1),
 (5, 'Andamiaje y Encofrado', 'Andamios certificados multidireccionales y puntales', 'grid', 1),
 (6, 'Topografia y Medicion', 'Estaciones totales, niveles laser y GPS de obra', 'compass', 1);

-- 6. TOOLS (20 herramientas)
INSERT INTO tools (id, provider_id, category_id, code_sku, name, brand, model, description, base_daily_price, deposit_amount, status, main_image_url, created_at, updated_at) VALUES
 (1, 1, 1, 'EXC-CAT-320', 'Excavadora Hidraulica 22 Ton', 'Caterpillar', '320D', 'Excavadora de oruga para movimiento masivo de tierras y zanjeo profundo', 850000.0, 3000000.0, 'DISPONIBLE', 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b', '2026-01-11 10:00:00', '2026-01-11 10:00:00'),
 (2, 2, 1, 'RET-JCB-3CX', 'Retroexcavadora 4x4', 'JCB', '3CX ECO', 'Retroexcavadora versatil para excavacion, carga y mantenimiento vial', 420000.0, 1500000.0, 'DISPONIBLE', 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece', '2026-01-11 10:00:00', '2026-01-11 10:00:00'),
 (3, 3, 2, 'COM-WAK-BS60', 'Apisonador Canguro 4 Tiempos', 'Wacker Neuson', 'BS60-4', 'Compactador de percusion para zanjas y cimientos estrechos', 75000.0, 300000.0, 'DISPONIBLE', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd', '2026-01-11 10:00:00', '2026-01-11 10:00:00'),
 (4, 4, 2, 'ROD-BOM-BW120', 'Rodillo Compactador 2.5 Ton', 'Bomag', 'BW 120 AD', 'Rodillo tandem vibratorio para asfaltos y bases granulares', 320000.0, 1200000.0, 'DISPONIBLE', 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7', '2026-01-11 10:00:00', '2026-01-11 10:00:00'),
 (5, 5, 3, 'MAR-BOS-GSH27', 'Martillo Demoledor Hexagonal 30 kg', 'Bosch', 'GSH 27 VC', 'Rompedor de concreto de alta energia de impacto para pavimentos y losas', 95000.0, 400000.0, 'DISPONIBLE', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758', '2026-01-11 10:00:00', '2026-01-11 10:00:00'),
 (6, 6, 3, 'COR-HUS-K770', 'Cortadora de Concreto 14 Pulg', 'Husqvarna', 'K770', 'Cortadora a gasolina para asfalto, concreto armado y juntas de dilatacion', 80000.0, 350000.0, 'DISPONIBLE', 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86', '2026-01-11 10:00:00', '2026-01-11 10:00:00'),
 (7, 7, 4, 'GEN-CAT-50KVA', 'Generador Insonorizado 50 kVA', 'Caterpillar', 'DE50', 'Planta electrica trifasica disel para campamentos y obra civil pesada', 380000.0, 1500000.0, 'DISPONIBLE', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232', '2026-01-11 10:00:00', '2026-01-11 10:00:00'),
 (8, 8, 4, 'BOM-HON-WT30', 'Motobomba de Lodos 3 Pulg', 'Honda', 'WT30X', 'Bomba centrifuga para aguas residuales y desague de zanjas inundadas', 65000.0, 250000.0, 'DISPONIBLE', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e', '2026-01-11 10:00:00', '2026-01-11 10:00:00'),
 (9, 9, 4, 'TOR-WAK-LTN6', 'Torre de Iluminacion 4x1000W', 'Wacker Neuson', 'LTN6L', 'Torre de luz disel mastil vertical 9m para jornadas nocturnas en vias', 180000.0, 700000.0, 'DISPONIBLE', 'https://images.unsplash.com/photo-1509391365360-2e959784a276', '2026-01-11 10:00:00', '2026-01-11 10:00:00'),
 (10, 10, 5, 'AND-LAY-ALL100', 'Andamio Multidireccional 100 m2', 'Layher', 'Allround', 'Estructura de andamiaje tubular certificada bajo norma europea EN 12810', 250000.0, 1000000.0, 'DISPONIBLE', 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7', '2026-01-11 10:00:00', '2026-01-11 10:00:00'),
 (11, 11, 5, 'ENC-PER-VARIO', 'Encofrado Metalico de Muros', 'Peri', 'Vario GT24', 'Formaleta modular para vaciado de columnas, muros de contencion y pantallas', 310000.0, 1200000.0, 'DISPONIBLE', 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece', '2026-01-11 10:00:00', '2026-01-11 10:00:00'),
 (12, 12, 6, 'EST-LEI-TS07', 'Estacion Total Laser 1 Seg', 'Leica Geosystems', 'FlexLine TS07', 'Equipo de precision milimetrica para replanteo topografico y vias', 210000.0, 1000000.0, 'DISPONIBLE', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758', '2026-01-11 10:00:00', '2026-01-11 10:00:00'),
 (13, 13, 6, 'NIV-TOP-ATB4', 'Nivel Optico Automatico 24X', 'Topcon', 'AT-B4A', 'Nivel topografico para nivelacion de losas, rasantes y pendientes', 45000.0, 200000.0, 'DISPONIBLE', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232', '2026-01-11 10:00:00', '2026-01-11 10:00:00'),
 (14, 14, 1, 'MIN-BOB-S590', 'Minicargador Oruga 1.2 Ton', 'Bobcat', 'S590', 'Minicargador compacto con balde de 0.5 m3 y barredora auxiliar', 310000.0, 1200000.0, 'DISPONIBLE', 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b', '2026-01-11 10:00:00', '2026-01-11 10:00:00'),
 (15, 15, 2, 'VIB-ENR-45MM', 'Vibrador de Concreto Gasolina', 'Enar', 'Vibr-Ant', 'Aguja vibradora de alta frecuencia para desalojar burbujas en vaciados', 55000.0, 200000.0, 'DISPONIBLE', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd', '2026-01-11 10:00:00', '2026-01-11 10:00:00'),
 (16, 16, 3, 'TAL-HIL-TE70', 'Rotomartillo SDS-Max 12 Joules', 'Hilti', 'TE 70-ATC', 'Taladro percutor pesado para fijaciones estructurales en hormigon', 85000.0, 350000.0, 'DISPONIBLE', 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86', '2026-01-11 10:00:00', '2026-01-11 10:00:00'),
 (17, 17, 4, 'COM-SUL-185', 'Compresor de Tornillo 185 CFM', 'Sullair', '185 T4F', 'Compresor de aire portatil para operacion simultanea de martillos neumaticos', 260000.0, 1100000.0, 'DISPONIBLE', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e', '2026-01-11 10:00:00', '2026-01-11 10:00:00'),
 (18, 18, 5, 'ESC-JLG-2632', 'Plataforma Elevadora Tijera 10m', 'JLG', '2632ES', 'Plataforma electrica autonoma para instalaciones aereas y acabados en altura', 280000.0, 1200000.0, 'DISPONIBLE', 'https://images.unsplash.com/photo-1509391365360-2e959784a276', '2026-01-11 10:00:00', '2026-01-11 10:00:00'),
 (19, 19, 1, 'MOT-CAT-140K', 'Motoniveladora 170 HP', 'Caterpillar', '140K', 'Motoniveladora para conformacion de subbases y peralte de vias', 920000.0, 3500000.0, 'DISPONIBLE', 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7', '2026-01-11 10:00:00', '2026-01-11 10:00:00'),
 (20, 20, 2, 'ALL-WHI-48IN', 'Allanadora de Concreto 48 Pulg', 'Whiteman', 'B48H11', 'Helicoptero para pulido y afinado industrial de pisos en hormigon', 90000.0, 350000.0, 'DISPONIBLE', 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece', '2026-01-11 10:00:00', '2026-01-11 10:00:00');

-- 7. TOOL_IMAGES (4FN: 20 imagenes)
INSERT INTO tool_images (id, tool_id, image_url, is_primary, caption) VALUES
 (1, 1, 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b', 1, 'Fotografia de inspeccion general y placa de fabricante'),
 (2, 2, 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece', 1, 'Fotografia de inspeccion general y placa de fabricante'),
 (3, 3, 'https://images.unsplash.com/photo-1504307651254-35680f356dfd', 1, 'Fotografia de inspeccion general y placa de fabricante'),
 (4, 4, 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7', 1, 'Fotografia de inspeccion general y placa de fabricante'),
 (5, 5, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758', 1, 'Fotografia de inspeccion general y placa de fabricante'),
 (6, 6, 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86', 1, 'Fotografia de inspeccion general y placa de fabricante'),
 (7, 7, 'https://images.unsplash.com/photo-1581092335397-9583fe92d232', 1, 'Fotografia de inspeccion general y placa de fabricante'),
 (8, 8, 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e', 1, 'Fotografia de inspeccion general y placa de fabricante'),
 (9, 9, 'https://images.unsplash.com/photo-1509391365360-2e959784a276', 1, 'Fotografia de inspeccion general y placa de fabricante'),
 (10, 10, 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7', 1, 'Fotografia de inspeccion general y placa de fabricante'),
 (11, 11, 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece', 1, 'Fotografia de inspeccion general y placa de fabricante'),
 (12, 12, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758', 1, 'Fotografia de inspeccion general y placa de fabricante'),
 (13, 13, 'https://images.unsplash.com/photo-1581092335397-9583fe92d232', 1, 'Fotografia de inspeccion general y placa de fabricante'),
 (14, 14, 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b', 1, 'Fotografia de inspeccion general y placa de fabricante'),
 (15, 15, 'https://images.unsplash.com/photo-1504307651254-35680f356dfd', 1, 'Fotografia de inspeccion general y placa de fabricante'),
 (16, 16, 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86', 1, 'Fotografia de inspeccion general y placa de fabricante'),
 (17, 17, 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e', 1, 'Fotografia de inspeccion general y placa de fabricante'),
 (18, 18, 'https://images.unsplash.com/photo-1509391365360-2e959784a276', 1, 'Fotografia de inspeccion general y placa de fabricante'),
 (19, 19, 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7', 1, 'Fotografia de inspeccion general y placa de fabricante'),
 (20, 20, 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece', 1, 'Fotografia de inspeccion general y placa de fabricante');

-- 8. TOOL_SPECIFICATIONS (4FN: 20 especificaciones)
INSERT INTO tool_specifications (id, tool_id, spec_name, spec_value) VALUES
 (1, 1, 'Potencia Motor', '148 HP @ 1800 rpm'),
 (2, 2, 'Capacidad Balde', '1.0 m3 frontal / 0.28 m3 retro'),
 (3, 3, 'Fuerza de Impacto', '14 kN / 700 golpes por min'),
 (4, 4, 'Frecuencia Vibracion', '60 Hz doble tambor'),
 (5, 5, 'Energia de Impacto', '62 Joules antivibracion'),
 (6, 6, 'Profundidad de Corte', '125 mm con disco 14 pulg'),
 (7, 7, 'Voltaje Salida', '220V / 440V Trifasico 60Hz'),
 (8, 8, 'Caudal Maximo', '1100 Litros por minuto'),
 (9, 9, 'Altura Mastil', '9 metros elevacion cabestrante'),
 (10, 10, 'Carga Admisible', '600 kg por m2'),
 (11, 11, 'Resistencia Presion', '80 kN por m2 concreto fresco'),
 (12, 12, 'Precision Angular', '1 segundo de arco'),
 (13, 13, 'Aumento Optico', '24X compensador magnetico'),
 (14, 14, 'Carga Operativa', '1150 kg en balde'),
 (15, 15, 'Diametro Aguja', '45 mm excéntrica pendular'),
 (16, 16, 'Encastre Mandril', 'SDS-Max ATC con embrague'),
 (17, 17, 'Presion Operativa', '100 psi regulada'),
 (18, 18, 'Altura Trabajo', '9.77 metros extensible'),
 (19, 19, 'Ancho Cuchilla', '3.66 metros con vertedera'),
 (20, 20, 'Diametro Rotor', '120 cm 4 aspas combinadas');

-- 9. TOOL_PRICING_TIERS (4FN: 20 escalas de precio)
INSERT INTO tool_pricing_tiers (id, tool_id, tier_type, min_days, price_per_day) VALUES
 (1, 1, 'SEMANAL', 7, 722500.0),
 (2, 2, 'SEMANAL', 7, 357000.0),
 (3, 3, 'SEMANAL', 7, 63750.0),
 (4, 4, 'SEMANAL', 7, 272000.0),
 (5, 5, 'SEMANAL', 7, 80750.0),
 (6, 6, 'SEMANAL', 7, 68000.0),
 (7, 7, 'SEMANAL', 7, 323000.0),
 (8, 8, 'SEMANAL', 7, 55250.0),
 (9, 9, 'SEMANAL', 7, 153000.0),
 (10, 10, 'SEMANAL', 7, 212500.0),
 (11, 11, 'SEMANAL', 7, 263500.0),
 (12, 12, 'SEMANAL', 7, 178500.0),
 (13, 13, 'SEMANAL', 7, 38250.0),
 (14, 14, 'SEMANAL', 7, 263500.0),
 (15, 15, 'SEMANAL', 7, 46750.0),
 (16, 16, 'SEMANAL', 7, 72250.0),
 (17, 17, 'SEMANAL', 7, 221000.0),
 (18, 18, 'SEMANAL', 7, 238000.0),
 (19, 19, 'SEMANAL', 7, 782000.0),
 (20, 20, 'SEMANAL', 7, 76500.0);

-- 10. TOOL_SAFETY_REQUIREMENTS (4FN: 20 protocolos EPP)
INSERT INTO tool_safety_requirements (id, tool_id, requirement_name, description) VALUES
 (1, 1, 'Certificacion Operador Rigger', 'Licencia C2 y certificacion SENA en movimiento de tierras vigente'),
 (2, 2, 'EPP Auditivo y Casco de Seguridad', 'Proteccion auditiva de copa mayor a 27 dB y barbuquejo'),
 (3, 3, 'Calzado con Puntera Dielectrica', 'Botas de seguridad con suela antideslizante norma ASTM F2413'),
 (4, 4, 'Chaleco Reflectivo Alta Visibilidad', 'Uso obligatorio de chaleco reflectivo Clase 3 en frente de obra'),
 (5, 5, 'Guantes Antivibracion Certificados', 'Guantes con absorcion de impacto norma EN ISO 10819'),
 (6, 6, 'Monogafas y Protector Facial', 'Careta de proteccion contra particulas de corte a alta velocidad'),
 (7, 7, 'Conexion a Puesta a Tierra', 'Instalacion de varilla de cobre de 2.4m antes de encendido'),
 (8, 8, 'Mangueras de Succion Clampadas', 'Asegurar abrazaderas tipo mariposa para evitar desacoples'),
 (9, 9, 'Fijacion de Estabilizadores', 'Nivelar patas mecanicas antes de elevar la torre de iluminacion'),
 (10, 10, 'Arnes de Cuerpo Entero', 'Arnes de seguridad de 4 puntos y linea de vida de 1.8m'),
 (11, 11, 'Revision de Mordazas de Encofrado', 'Asegurar cuñas y pasadores con torque especificado por fabricante'),
 (12, 12, 'Calibracion Certificada', 'Manejo exclusivo por topografo matriculado con certificado anual'),
 (13, 13, 'Tripode de Aluminio Firme', 'Enterrar zapatas de tripode en terreno estable antes de estacionar'),
 (14, 14, 'Cinturon de Seguridad en Cabina', 'Operacion con puertas cerradas y sensor de presencia activo'),
 (15, 15, 'Proteccion Respiratoria para Concreto', 'Mascarilla N95 para control de polvo de silice y vapores'),
 (16, 16, 'Empunadura Lateral de Seguridad', 'Sujecion firme con ambas manos y tope de profundidad regulado'),
 (17, 17, 'Cables de Retencion de Manguera', 'Instalar guayas antilatigazo en acoples de presion de aire'),
 (18, 18, 'Arnes y Baranda de Contencion', 'Enganchar linea de vida al punto de anclaje certificado de la canastilla'),
 (19, 19, 'Senalizacion Perimetral con Conos', 'Delimitar radio de giro de 15 metros en carril de trabajo'),
 (20, 20, 'Palanca de Hombre Muerto Activa', 'Verificar corte automatico de ignicion al soltar el manillar');

-- 11. RESERVATIONS (20 reservas activas e historicas)
INSERT INTO reservations (id, reservation_code, client_id, tool_id, start_date, end_date, total_days, daily_price_applied, subtotal, tax_amount, deposit_amount, total_price, status, notes, created_at, updated_at) VALUES
 (1, 'RES-2026-1001', 1, 1, '2026-02-11', '2026-02-14', 3, 850000.0, 2550000.0, 484500.0, 3000000.0, 6034500.0, 'EN_CURSO', 'Contrato de alquiler para frente de obra #1', '2026-02-01 10:00:00', '2026-02-01 10:00:00'),
 (2, 'RES-2026-1002', 2, 2, '2026-02-12', '2026-02-15', 3, 420000.0, 1260000.0, 239400.0, 1500000.0, 2999400.0, 'EN_CURSO', 'Contrato de alquiler para frente de obra #2', '2026-02-01 10:00:00', '2026-02-01 10:00:00'),
 (3, 'RES-2026-1003', 3, 3, '2026-02-13', '2026-02-20', 7, 63750.0, 446250.0, 84787.5, 300000.0, 831037.5, 'EN_CURSO', 'Contrato de alquiler para frente de obra #3', '2026-02-01 10:00:00', '2026-02-01 10:00:00'),
 (4, 'RES-2026-1004', 4, 4, '2026-02-14', '2026-02-17', 3, 320000.0, 960000.0, 182400.0, 1200000.0, 2342400.0, 'EN_CURSO', 'Contrato de alquiler para frente de obra #4', '2026-02-01 10:00:00', '2026-02-01 10:00:00'),
 (5, 'RES-2026-1005', 5, 5, '2026-02-15', '2026-02-18', 3, 95000.0, 285000.0, 54150.0, 400000.0, 739150.0, 'EN_CURSO', 'Contrato de alquiler para frente de obra #5', '2026-02-01 10:00:00', '2026-02-01 10:00:00'),
 (6, 'RES-2026-1006', 6, 6, '2026-02-16', '2026-02-23', 7, 68000.0, 476000.0, 90440.0, 350000.0, 916440.0, 'EN_CURSO', 'Contrato de alquiler para frente de obra #6', '2026-02-01 10:00:00', '2026-02-01 10:00:00'),
 (7, 'RES-2026-1007', 7, 7, '2026-02-17', '2026-02-20', 3, 380000.0, 1140000.0, 216600.0, 1500000.0, 2856600.0, 'EN_CURSO', 'Contrato de alquiler para frente de obra #7', '2026-02-01 10:00:00', '2026-02-01 10:00:00'),
 (8, 'RES-2026-1008', 8, 8, '2026-02-18', '2026-02-21', 3, 65000.0, 195000.0, 37050.0, 250000.0, 482050.0, 'EN_CURSO', 'Contrato de alquiler para frente de obra #8', '2026-02-01 10:00:00', '2026-02-01 10:00:00'),
 (9, 'RES-2026-1009', 9, 9, '2026-02-19', '2026-02-26', 7, 153000.0, 1071000.0, 203490.0, 700000.0, 1974490.0, 'EN_CURSO', 'Contrato de alquiler para frente de obra #9', '2026-02-01 10:00:00', '2026-02-01 10:00:00'),
 (10, 'RES-2026-1010', 10, 10, '2026-02-10', '2026-02-13', 3, 250000.0, 750000.0, 142500.0, 1000000.0, 1892500.0, 'EN_CURSO', 'Contrato de alquiler para frente de obra #10', '2026-02-01 10:00:00', '2026-02-01 10:00:00'),
 (11, 'RES-2026-1011', 11, 11, '2026-02-11', '2026-02-14', 3, 310000.0, 930000.0, 176700.0, 1200000.0, 2306700.0, 'FINALIZADA', 'Contrato de alquiler para frente de obra #11', '2026-02-01 10:00:00', '2026-02-01 10:00:00'),
 (12, 'RES-2026-1012', 12, 12, '2026-02-12', '2026-02-19', 7, 178500.0, 1249500.0, 237405.0, 1000000.0, 2486905.0, 'FINALIZADA', 'Contrato de alquiler para frente de obra #12', '2026-02-01 10:00:00', '2026-02-01 10:00:00'),
 (13, 'RES-2026-1013', 13, 13, '2026-02-13', '2026-02-16', 3, 45000.0, 135000.0, 25650.0, 200000.0, 360650.0, 'FINALIZADA', 'Contrato de alquiler para frente de obra #13', '2026-02-01 10:00:00', '2026-02-01 10:00:00'),
 (14, 'RES-2026-1014', 14, 14, '2026-02-14', '2026-02-17', 3, 310000.0, 930000.0, 176700.0, 1200000.0, 2306700.0, 'FINALIZADA', 'Contrato de alquiler para frente de obra #14', '2026-02-01 10:00:00', '2026-02-01 10:00:00'),
 (15, 'RES-2026-1015', 15, 15, '2026-02-15', '2026-02-22', 7, 46750.0, 327250.0, 62177.5, 200000.0, 589427.5, 'FINALIZADA', 'Contrato de alquiler para frente de obra #15', '2026-02-01 10:00:00', '2026-02-01 10:00:00'),
 (16, 'RES-2026-1016', 16, 16, '2026-02-16', '2026-02-19', 3, 85000.0, 255000.0, 48450.0, 350000.0, 653450.0, 'FINALIZADA', 'Contrato de alquiler para frente de obra #16', '2026-02-01 10:00:00', '2026-02-01 10:00:00'),
 (17, 'RES-2026-1017', 17, 17, '2026-02-17', '2026-02-20', 3, 260000.0, 780000.0, 148200.0, 1100000.0, 2028200.0, 'FINALIZADA', 'Contrato de alquiler para frente de obra #17', '2026-02-01 10:00:00', '2026-02-01 10:00:00'),
 (18, 'RES-2026-1018', 18, 18, '2026-02-18', '2026-02-25', 7, 238000.0, 1666000.0, 316540.0, 1200000.0, 3182540.0, 'FINALIZADA', 'Contrato de alquiler para frente de obra #18', '2026-02-01 10:00:00', '2026-02-01 10:00:00'),
 (19, 'RES-2026-1019', 19, 19, '2026-02-19', '2026-02-22', 3, 920000.0, 2760000.0, 524400.0, 3500000.0, 6784400.0, 'APROBADA', 'Contrato de alquiler para frente de obra #19', '2026-02-01 10:00:00', '2026-02-01 10:00:00'),
 (20, 'RES-2026-1020', 20, 20, '2026-02-10', '2026-02-13', 3, 90000.0, 270000.0, 51300.0, 350000.0, 671300.0, 'APROBADA', 'Contrato de alquiler para frente de obra #20', '2026-02-01 10:00:00', '2026-02-01 10:00:00');

-- 12. PAYMENTS (20 transacciones liquidadas)
INSERT INTO payments (id, reservation_id, amount, payment_method, status, transaction_reference, installment_count, payment_date) VALUES
 (1, 1, 6034500.0, 'PSE', 'COMPLETADO', 'TXN-2026-9001', 1, '2026-02-02 11:00:00'),
 (2, 2, 2999400.0, 'TRANSFERENCIA', 'COMPLETADO', 'TXN-2026-9002', 1, '2026-02-02 11:00:00'),
 (3, 3, 831037.5, 'TARJETA_CREDITO', 'COMPLETADO', 'TXN-2026-9003', 1, '2026-02-02 11:00:00'),
 (4, 4, 2342400.0, 'PSE', 'COMPLETADO', 'TXN-2026-9004', 1, '2026-02-02 11:00:00'),
 (5, 5, 739150.0, 'TRANSFERENCIA', 'COMPLETADO', 'TXN-2026-9005', 1, '2026-02-02 11:00:00'),
 (6, 6, 916440.0, 'TARJETA_CREDITO', 'COMPLETADO', 'TXN-2026-9006', 1, '2026-02-02 11:00:00'),
 (7, 7, 2856600.0, 'PSE', 'COMPLETADO', 'TXN-2026-9007', 1, '2026-02-02 11:00:00'),
 (8, 8, 482050.0, 'TRANSFERENCIA', 'COMPLETADO', 'TXN-2026-9008', 1, '2026-02-02 11:00:00'),
 (9, 9, 1974490.0, 'TARJETA_CREDITO', 'COMPLETADO', 'TXN-2026-9009', 1, '2026-02-02 11:00:00'),
 (10, 10, 1892500.0, 'PSE', 'COMPLETADO', 'TXN-2026-9010', 1, '2026-02-02 11:00:00'),
 (11, 11, 2306700.0, 'TRANSFERENCIA', 'COMPLETADO', 'TXN-2026-9011', 1, '2026-02-02 11:00:00'),
 (12, 12, 2486905.0, 'TARJETA_CREDITO', 'COMPLETADO', 'TXN-2026-9012', 1, '2026-02-02 11:00:00'),
 (13, 13, 360650.0, 'PSE', 'COMPLETADO', 'TXN-2026-9013', 1, '2026-02-02 11:00:00'),
 (14, 14, 2306700.0, 'TRANSFERENCIA', 'COMPLETADO', 'TXN-2026-9014', 1, '2026-02-02 11:00:00'),
 (15, 15, 589427.5, 'TARJETA_CREDITO', 'COMPLETADO', 'TXN-2026-9015', 1, '2026-02-02 11:00:00'),
 (16, 16, 653450.0, 'PSE', 'COMPLETADO', 'TXN-2026-9016', 1, '2026-02-02 11:00:00'),
 (17, 17, 2028200.0, 'TRANSFERENCIA', 'COMPLETADO', 'TXN-2026-9017', 1, '2026-02-02 11:00:00'),
 (18, 18, 3182540.0, 'TARJETA_CREDITO', 'COMPLETADO', 'TXN-2026-9018', 1, '2026-02-02 11:00:00'),
 (19, 19, 6784400.0, 'PSE', 'COMPLETADO', 'TXN-2026-9019', 1, '2026-02-02 11:00:00'),
 (20, 20, 671300.0, 'TRANSFERENCIA', 'COMPLETADO', 'TXN-2026-9020', 1, '2026-02-02 11:00:00');

-- 13. INVOICES (20 facturas electronicas DIAN con CUFE)
INSERT INTO invoices (id, invoice_number, payment_id, reservation_id, cufe, client_nit_cc, client_name, subtotal, tax_amount, deposit_held, total_amount, issued_at, pdf_url) VALUES
 (1, 'FE-2026-5001', 1, 1, 'CUFE-SHA256-0001-DIAN-COLOMBIA-RENTA2026-VAL', '1000007919', 'Carlos Gomez', 2550000.0, 484500.0, 3000000.0, 6034500.0, '2026-02-02 11:05:00', 'https://rentamaq.co/facturas/FE-2026-5001.pdf'),
 (2, 'FE-2026-5002', 2, 2, 'CUFE-SHA256-0002-DIAN-COLOMBIA-RENTA2026-VAL', '1000015838', 'Maria Rodriguez', 1260000.0, 239400.0, 1500000.0, 2999400.0, '2026-02-02 11:05:00', 'https://rentamaq.co/facturas/FE-2026-5002.pdf'),
 (3, 'FE-2026-5003', 3, 3, 'CUFE-SHA256-0003-DIAN-COLOMBIA-RENTA2026-VAL', '1000023757', 'Andres Martinez', 446250.0, 84787.5, 300000.0, 831037.5, '2026-02-02 11:05:00', 'https://rentamaq.co/facturas/FE-2026-5003.pdf'),
 (4, 'FE-2026-5004', 4, 4, 'CUFE-SHA256-0004-DIAN-COLOMBIA-RENTA2026-VAL', '1000031676', 'Laura Lopez', 960000.0, 182400.0, 1200000.0, 2342400.0, '2026-02-02 11:05:00', 'https://rentamaq.co/facturas/FE-2026-5004.pdf'),
 (5, 'FE-2026-5005', 5, 5, 'CUFE-SHA256-0005-DIAN-COLOMBIA-RENTA2026-VAL', '1000039595', 'Juan Hernandez', 285000.0, 54150.0, 400000.0, 739150.0, '2026-02-02 11:05:00', 'https://rentamaq.co/facturas/FE-2026-5005.pdf'),
 (6, 'FE-2026-5006', 6, 6, 'CUFE-SHA256-0006-DIAN-COLOMBIA-RENTA2026-VAL', '1000047514', 'Sofia Perez', 476000.0, 90440.0, 350000.0, 916440.0, '2026-02-02 11:05:00', 'https://rentamaq.co/facturas/FE-2026-5006.pdf'),
 (7, 'FE-2026-5007', 7, 7, 'CUFE-SHA256-0007-DIAN-COLOMBIA-RENTA2026-VAL', '1000055433', 'Diego Ramirez', 1140000.0, 216600.0, 1500000.0, 2856600.0, '2026-02-02 11:05:00', 'https://rentamaq.co/facturas/FE-2026-5007.pdf'),
 (8, 'FE-2026-5008', 8, 8, 'CUFE-SHA256-0008-DIAN-COLOMBIA-RENTA2026-VAL', '1000063352', 'Camila Torres', 195000.0, 37050.0, 250000.0, 482050.0, '2026-02-02 11:05:00', 'https://rentamaq.co/facturas/FE-2026-5008.pdf'),
 (9, 'FE-2026-5009', 9, 9, 'CUFE-SHA256-0009-DIAN-COLOMBIA-RENTA2026-VAL', '1000071271', 'Felipe Diaz', 1071000.0, 203490.0, 700000.0, 1974490.0, '2026-02-02 11:05:00', 'https://rentamaq.co/facturas/FE-2026-5009.pdf'),
 (10, 'FE-2026-5010', 10, 10, 'CUFE-SHA256-0010-DIAN-COLOMBIA-RENTA2026-VAL', '1000079190', 'Valentina Vargas', 750000.0, 142500.0, 1000000.0, 1892500.0, '2026-02-02 11:05:00', 'https://rentamaq.co/facturas/FE-2026-5010.pdf'),
 (11, 'FE-2026-5011', 11, 11, 'CUFE-SHA256-0011-DIAN-COLOMBIA-RENTA2026-VAL', '1000087109', 'Santiago Castro', 930000.0, 176700.0, 1200000.0, 2306700.0, '2026-02-02 11:05:00', 'https://rentamaq.co/facturas/FE-2026-5011.pdf'),
 (12, 'FE-2026-5012', 12, 12, 'CUFE-SHA256-0012-DIAN-COLOMBIA-RENTA2026-VAL', '1000095028', 'Daniela Rojas', 1249500.0, 237405.0, 1000000.0, 2486905.0, '2026-02-02 11:05:00', 'https://rentamaq.co/facturas/FE-2026-5012.pdf'),
 (13, 'FE-2026-5013', 13, 13, 'CUFE-SHA256-0013-DIAN-COLOMBIA-RENTA2026-VAL', '1000102947', 'Mateo Moreno', 135000.0, 25650.0, 200000.0, 360650.0, '2026-02-02 11:05:00', 'https://rentamaq.co/facturas/FE-2026-5013.pdf'),
 (14, 'FE-2026-5014', 14, 14, 'CUFE-SHA256-0014-DIAN-COLOMBIA-RENTA2026-VAL', '1000110866', 'Paula Jimenez', 930000.0, 176700.0, 1200000.0, 2306700.0, '2026-02-02 11:05:00', 'https://rentamaq.co/facturas/FE-2026-5014.pdf'),
 (15, 'FE-2026-5015', 15, 15, 'CUFE-SHA256-0015-DIAN-COLOMBIA-RENTA2026-VAL', '1000118785', 'Sebastian Ortiz', 327250.0, 62177.5, 200000.0, 589427.5, '2026-02-02 11:05:00', 'https://rentamaq.co/facturas/FE-2026-5015.pdf'),
 (16, 'FE-2026-5016', 16, 16, 'CUFE-SHA256-0016-DIAN-COLOMBIA-RENTA2026-VAL', '1000126704', 'Natalia Silva', 255000.0, 48450.0, 350000.0, 653450.0, '2026-02-02 11:05:00', 'https://rentamaq.co/facturas/FE-2026-5016.pdf'),
 (17, 'FE-2026-5017', 17, 17, 'CUFE-SHA256-0017-DIAN-COLOMBIA-RENTA2026-VAL', '1000134623', 'Julian Mendoza', 780000.0, 148200.0, 1100000.0, 2028200.0, '2026-02-02 11:05:00', 'https://rentamaq.co/facturas/FE-2026-5017.pdf'),
 (18, 'FE-2026-5018', 18, 18, 'CUFE-SHA256-0018-DIAN-COLOMBIA-RENTA2026-VAL', '1000142542', 'Carolina Cardona', 1666000.0, 316540.0, 1200000.0, 3182540.0, '2026-02-02 11:05:00', 'https://rentamaq.co/facturas/FE-2026-5018.pdf'),
 (19, 'FE-2026-5019', 19, 19, 'CUFE-SHA256-0019-DIAN-COLOMBIA-RENTA2026-VAL', '1000150461', 'Esteban Ruiz', 2760000.0, 524400.0, 3500000.0, 6784400.0, '2026-02-02 11:05:00', 'https://rentamaq.co/facturas/FE-2026-5019.pdf'),
 (20, 'FE-2026-5020', 20, 20, 'CUFE-SHA256-0020-DIAN-COLOMBIA-RENTA2026-VAL', '1000158380', 'Luisa Herrera', 270000.0, 51300.0, 350000.0, 671300.0, '2026-02-02 11:05:00', 'https://rentamaq.co/facturas/FE-2026-5020.pdf');

-- 14. RENTAL_DELIVERIES (20 actas de despacho a obra)
INSERT INTO rental_deliveries (id, reservation_id, delivery_date, initial_operating_hours, delivery_notes, operator_name) VALUES
 (1, 1, '2026-02-10 08:30:00', 120, 'Equipo entregado en perfecto estado operativo con fluidos al nivel y tanque lleno', 'Operador Despacho Carlos'),
 (2, 2, '2026-02-10 08:30:00', 240, 'Equipo entregado en perfecto estado operativo con fluidos al nivel y tanque lleno', 'Operador Despacho Maria'),
 (3, 3, '2026-02-10 08:30:00', 360, 'Equipo entregado en perfecto estado operativo con fluidos al nivel y tanque lleno', 'Operador Despacho Andres'),
 (4, 4, '2026-02-10 08:30:00', 480, 'Equipo entregado en perfecto estado operativo con fluidos al nivel y tanque lleno', 'Operador Despacho Laura'),
 (5, 5, '2026-02-10 08:30:00', 600, 'Equipo entregado en perfecto estado operativo con fluidos al nivel y tanque lleno', 'Operador Despacho Juan'),
 (6, 6, '2026-02-10 08:30:00', 720, 'Equipo entregado en perfecto estado operativo con fluidos al nivel y tanque lleno', 'Operador Despacho Sofia'),
 (7, 7, '2026-02-10 08:30:00', 840, 'Equipo entregado en perfecto estado operativo con fluidos al nivel y tanque lleno', 'Operador Despacho Diego'),
 (8, 8, '2026-02-10 08:30:00', 960, 'Equipo entregado en perfecto estado operativo con fluidos al nivel y tanque lleno', 'Operador Despacho Camila'),
 (9, 9, '2026-02-10 08:30:00', 1080, 'Equipo entregado en perfecto estado operativo con fluidos al nivel y tanque lleno', 'Operador Despacho Felipe'),
 (10, 10, '2026-02-10 08:30:00', 1200, 'Equipo entregado en perfecto estado operativo con fluidos al nivel y tanque lleno', 'Operador Despacho Valentina'),
 (11, 11, '2026-02-10 08:30:00', 1320, 'Equipo entregado en perfecto estado operativo con fluidos al nivel y tanque lleno', 'Operador Despacho Santiago'),
 (12, 12, '2026-02-10 08:30:00', 1440, 'Equipo entregado en perfecto estado operativo con fluidos al nivel y tanque lleno', 'Operador Despacho Daniela'),
 (13, 13, '2026-02-10 08:30:00', 1560, 'Equipo entregado en perfecto estado operativo con fluidos al nivel y tanque lleno', 'Operador Despacho Mateo'),
 (14, 14, '2026-02-10 08:30:00', 1680, 'Equipo entregado en perfecto estado operativo con fluidos al nivel y tanque lleno', 'Operador Despacho Paula'),
 (15, 15, '2026-02-10 08:30:00', 1800, 'Equipo entregado en perfecto estado operativo con fluidos al nivel y tanque lleno', 'Operador Despacho Sebastian'),
 (16, 16, '2026-02-10 08:30:00', 1920, 'Equipo entregado en perfecto estado operativo con fluidos al nivel y tanque lleno', 'Operador Despacho Natalia'),
 (17, 17, '2026-02-10 08:30:00', 2040, 'Equipo entregado en perfecto estado operativo con fluidos al nivel y tanque lleno', 'Operador Despacho Julian'),
 (18, 18, '2026-02-10 08:30:00', 2160, 'Equipo entregado en perfecto estado operativo con fluidos al nivel y tanque lleno', 'Operador Despacho Carolina'),
 (19, 19, '2026-02-10 08:30:00', 2280, 'Equipo entregado en perfecto estado operativo con fluidos al nivel y tanque lleno', 'Operador Despacho Esteban'),
 (20, 20, '2026-02-10 08:30:00', 2400, 'Equipo entregado en perfecto estado operativo con fluidos al nivel y tanque lleno', 'Operador Despacho Luisa');

-- 15. RENTAL_RETURNS (20 actas de devolucion e inspeccion)
INSERT INTO rental_returns (id, reservation_id, return_date, final_operating_hours, return_condition, return_notes, penalty_fee) VALUES
 (1, 1, '2026-02-17 17:00:00', 155, 'BUENO', 'Inspeccion fisica realizada en patio logistico', 0.0),
 (2, 2, '2026-02-17 17:00:00', 275, 'BUENO', 'Inspeccion fisica realizada en patio logistico', 0.0),
 (3, 3, '2026-02-17 17:00:00', 395, 'BUENO', 'Inspeccion fisica realizada en patio logistico', 0.0),
 (4, 4, '2026-02-17 17:00:00', 515, 'REGULAR', 'Inspeccion fisica realizada en patio logistico', 0.0),
 (5, 5, '2026-02-17 17:00:00', 635, 'BUENO', 'Inspeccion fisica realizada en patio logistico', 0.0),
 (6, 6, '2026-02-17 17:00:00', 755, 'BUENO', 'Inspeccion fisica realizada en patio logistico', 0.0),
 (7, 7, '2026-02-17 17:00:00', 875, 'DANADO', 'Inspeccion fisica realizada en patio logistico', 180000.0),
 (8, 8, '2026-02-17 17:00:00', 995, 'REGULAR', 'Inspeccion fisica realizada en patio logistico', 0.0),
 (9, 9, '2026-02-17 17:00:00', 1115, 'BUENO', 'Inspeccion fisica realizada en patio logistico', 0.0),
 (10, 10, '2026-02-17 17:00:00', 1235, 'BUENO', 'Inspeccion fisica realizada en patio logistico', 0.0),
 (11, 11, '2026-02-17 17:00:00', 1355, 'BUENO', 'Inspeccion fisica realizada en patio logistico', 0.0),
 (12, 12, '2026-02-17 17:00:00', 1475, 'REGULAR', 'Inspeccion fisica realizada en patio logistico', 0.0),
 (13, 13, '2026-02-17 17:00:00', 1595, 'BUENO', 'Inspeccion fisica realizada en patio logistico', 0.0),
 (14, 14, '2026-02-17 17:00:00', 1715, 'DANADO', 'Inspeccion fisica realizada en patio logistico', 180000.0),
 (15, 15, '2026-02-17 17:00:00', 1835, 'BUENO', 'Inspeccion fisica realizada en patio logistico', 0.0),
 (16, 16, '2026-02-17 17:00:00', 1955, 'REGULAR', 'Inspeccion fisica realizada en patio logistico', 0.0),
 (17, 17, '2026-02-17 17:00:00', 2075, 'BUENO', 'Inspeccion fisica realizada en patio logistico', 0.0),
 (18, 18, '2026-02-17 17:00:00', 2195, 'BUENO', 'Inspeccion fisica realizada en patio logistico', 0.0),
 (19, 19, '2026-02-17 17:00:00', 2315, 'BUENO', 'Inspeccion fisica realizada en patio logistico', 0.0),
 (20, 20, '2026-02-17 17:00:00', 2435, 'REGULAR', 'Inspeccion fisica realizada en patio logistico', 0.0);

-- 16. DAMAGE_REPORTS (Reportes tecnicos de siniestro y reparacion)
INSERT INTO damage_reports (id, rental_return_id, description, estimated_repair_cost, severity, photos_url, created_at) VALUES
 (1, 7, 'Desgaste anormal en oruga izquierda por piedras en cantera', 180000.0, 'MODERADO', 'https://rentamaq.co/danos/dam-001.jpg', '2026-02-18 09:00:00'),
 (2, 14, 'Fisura menor en manguera de retorno de aceite hidraulico', 95000.0, 'LEVE', 'https://rentamaq.co/danos/dam-002.jpg', '2026-02-18 09:00:00'),
 (3, 4, 'Abolladura en guarda de proteccion de motor disel', 120000.0, 'LEVE', 'https://rentamaq.co/danos/dam-003.jpg', '2026-02-18 09:00:00'),
 (4, 8, 'Filtro de aire saturado de cemento y polvo fino de obra', 65000.0, 'LEVE', 'https://rentamaq.co/danos/dam-004.jpg', '2026-02-18 09:00:00'),
 (5, 12, 'Dano en cable de alimentacion de 220V por aprisionamiento', 85000.0, 'MODERADO', 'https://rentamaq.co/danos/dam-005.jpg', '2026-02-18 09:00:00');

-- 17. REVIEWS (20 calificaciones y testimonios verificados)
INSERT INTO reviews (id, tool_id, client_id, reservation_id, rating, comment, created_at) VALUES
 (1, 1, 1, 1, 5, 'Excelente rendimiento en obra civil, cero fallas en jornada continua.', '2026-02-18 10:00:00'),
 (2, 2, 2, 2, 5, 'Equipo entregado puntual y con tanque lleno. Muy confiable.', '2026-02-18 10:00:00'),
 (3, 3, 3, 3, 4, 'La maquinaria respondio de acuerdo a las especificaciones tecnicas.', '2026-02-18 10:00:00'),
 (4, 4, 4, 4, 5, 'Muy buena atencion del proveedor y soporte mecanico rapido.', '2026-02-18 10:00:00'),
 (5, 5, 5, 5, 5, 'Potencia sobresaliente para trabajo pesado en terreno rocoso.', '2026-02-18 10:00:00'),
 (6, 6, 6, 6, 4, 'Excelente rendimiento en obra civil, cero fallas en jornada continua.', '2026-02-18 10:00:00'),
 (7, 7, 7, 7, 5, 'Equipo entregado puntual y con tanque lleno. Muy confiable.', '2026-02-18 10:00:00'),
 (8, 8, 8, 8, 5, 'La maquinaria respondio de acuerdo a las especificaciones tecnicas.', '2026-02-18 10:00:00'),
 (9, 9, 9, 9, 4, 'Muy buena atencion del proveedor y soporte mecanico rapido.', '2026-02-18 10:00:00'),
 (10, 10, 10, 10, 5, 'Potencia sobresaliente para trabajo pesado en terreno rocoso.', '2026-02-18 10:00:00'),
 (11, 11, 11, 11, 5, 'Excelente rendimiento en obra civil, cero fallas en jornada continua.', '2026-02-18 10:00:00'),
 (12, 12, 12, 12, 4, 'Equipo entregado puntual y con tanque lleno. Muy confiable.', '2026-02-18 10:00:00'),
 (13, 13, 13, 13, 5, 'La maquinaria respondio de acuerdo a las especificaciones tecnicas.', '2026-02-18 10:00:00'),
 (14, 14, 14, 14, 5, 'Muy buena atencion del proveedor y soporte mecanico rapido.', '2026-02-18 10:00:00'),
 (15, 15, 15, 15, 4, 'Potencia sobresaliente para trabajo pesado en terreno rocoso.', '2026-02-18 10:00:00'),
 (16, 16, 16, 16, 5, 'Excelente rendimiento en obra civil, cero fallas en jornada continua.', '2026-02-18 10:00:00'),
 (17, 17, 17, 17, 5, 'Equipo entregado puntual y con tanque lleno. Muy confiable.', '2026-02-18 10:00:00'),
 (18, 18, 18, 18, 4, 'La maquinaria respondio de acuerdo a las especificaciones tecnicas.', '2026-02-18 10:00:00'),
 (19, 19, 19, 19, 5, 'Muy buena atencion del proveedor y soporte mecanico rapido.', '2026-02-18 10:00:00'),
 (20, 20, 20, 20, 5, 'Potencia sobresaliente para trabajo pesado en terreno rocoso.', '2026-02-18 10:00:00');

SET FOREIGN_KEY_CHECKS = 1;

-- FIN DE SCRIPT DE DATOS (20+ REGISTROS POR ENTIDAD EN MYSQL)
