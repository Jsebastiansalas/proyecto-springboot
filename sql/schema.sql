-- ============================================================================
-- PLATAFORMA DE RENTA DE HERRAMIENTAS Y EQUIPOS DE CONSTRUCCIÓN
-- BASE DE DATOS: PostgreSQL 16+ / pgAdmin
-- MODELO RELACIONAL NORMALIZADO EN CUARTA FORMA NORMAL (4FN)
-- ============================================================================

-- Limpieza preventiva de tablas en orden inverso de dependencias
DROP TABLE IF EXISTS damage_reports CASCADE;
DROP TABLE IF EXISTS rental_returns CASCADE;
DROP TABLE IF EXISTS rental_deliveries CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS tool_safety_requirements CASCADE;
DROP TABLE IF EXISTS tool_pricing_tiers CASCADE;
DROP TABLE IF EXISTS tool_specifications CASCADE;
DROP TABLE IF EXISTS tool_images CASCADE;
DROP TABLE IF EXISTS tools CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS providers CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ----------------------------------------------------------------------------
-- 1. TABLA: roles
-- Catálogo de roles de autorización en el sistema
-- ----------------------------------------------------------------------------
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 2. TABLA: users
-- Credenciales y autenticación del sistema (JWT)
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE RESTRICT
);

CREATE INDEX idx_users_email ON users (email);

-- ----------------------------------------------------------------------------
-- 3. TABLA: clients
-- Perfil de clientes contratistas y particulares
-- ----------------------------------------------------------------------------
CREATE TABLE clients (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    document_type VARCHAR(20) NOT NULL, -- CC, CE, PASAPORTE, NIT
    document_number VARCHAR(50) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL,
    address VARCHAR(200) NOT NULL,
    city VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_clients_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_clients_doc ON clients (document_number);

-- ----------------------------------------------------------------------------
-- 4. TABLA: providers
-- Perfil de empresas y proveedores propietarios de maquinaria
-- ----------------------------------------------------------------------------
CREATE TABLE providers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    company_name VARCHAR(150) NOT NULL,
    legal_representative VARCHAR(150) NOT NULL,
    nit_rut VARCHAR(50) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL,
    address VARCHAR(200) NOT NULL,
    city VARCHAR(100) NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_providers_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_providers_nit ON providers (nit_rut);

-- ----------------------------------------------------------------------------
-- 5. TABLA: categories
-- Categorías de herramientas y equipos
-- ----------------------------------------------------------------------------
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon_name VARCHAR(50) DEFAULT 'wrench'
);

-- ----------------------------------------------------------------------------
-- 6. TABLA: tools
-- Entidad maestra de herramientas y equipos de construcción
-- ----------------------------------------------------------------------------
CREATE TABLE tools (
    id BIGSERIAL PRIMARY KEY,
    provider_id BIGINT NOT NULL,
    category_id INT NOT NULL,
    code_sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    base_daily_price NUMERIC(12, 2) NOT NULL CHECK (base_daily_price > 0),
    deposit_amount NUMERIC(12, 2) NOT NULL CHECK (deposit_amount >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'DISPONIBLE', -- DISPONIBLE, ALQUILADA, MANTENIMIENTO, RETIRADA
    main_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tools_provider FOREIGN KEY (provider_id) REFERENCES providers (id) ON DELETE RESTRICT,
    CONSTRAINT fk_tools_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT
);

CREATE INDEX idx_tools_provider ON tools (provider_id);
CREATE INDEX idx_tools_category ON tools (category_id);
CREATE INDEX idx_tools_status ON tools (status);

-- ============================================================================
-- NORMALIZACIÓN 4FN: DESACOPLAMIENTO DE DEPENDENCIAS MULTIVALUADAS (MVD)
-- Una herramienta posee múltiples imágenes, múltiples especificaciones,
-- múltiples tarifas de periodo y múltiples requisitos de seguridad independientes.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 7. TABLA: tool_images (4FN)
-- Galería de imágenes independiente
-- ----------------------------------------------------------------------------
CREATE TABLE tool_images (
    id BIGSERIAL PRIMARY KEY,
    tool_id BIGINT NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    caption VARCHAR(200),
    CONSTRAINT fk_tool_images_tool FOREIGN KEY (tool_id) REFERENCES tools (id) ON DELETE CASCADE
);

CREATE INDEX idx_tool_images_tool ON tool_images (tool_id);

-- ----------------------------------------------------------------------------
-- 8. TABLA: tool_specifications (4FN)
-- Ficha técnica desacoplada (clave-valor)
-- ----------------------------------------------------------------------------
CREATE TABLE tool_specifications (
    id BIGSERIAL PRIMARY KEY,
    tool_id BIGINT NOT NULL,
    spec_name VARCHAR(100) NOT NULL,
    spec_value VARCHAR(255) NOT NULL,
    CONSTRAINT fk_tool_specs_tool FOREIGN KEY (tool_id) REFERENCES tools (id) ON DELETE CASCADE,
    CONSTRAINT uq_tool_spec UNIQUE (tool_id, spec_name)
);

CREATE INDEX idx_tool_specs_tool ON tool_specifications (tool_id);

-- ----------------------------------------------------------------------------
-- 9. TABLA: tool_pricing_tiers (4FN)
-- Tarifario por volumen/duración independiente
-- ----------------------------------------------------------------------------
CREATE TABLE tool_pricing_tiers (
    id BIGSERIAL PRIMARY KEY,
    tool_id BIGINT NOT NULL,
    tier_type VARCHAR(50) NOT NULL, -- DIARIO, SEMANAL, QUINCENAL, MENSUAL
    min_days INT NOT NULL CHECK (min_days > 0),
    price_per_day NUMERIC(12, 2) NOT NULL CHECK (price_per_day > 0),
    CONSTRAINT fk_tool_pricing_tool FOREIGN KEY (tool_id) REFERENCES tools (id) ON DELETE CASCADE,
    CONSTRAINT uq_tool_tier UNIQUE (tool_id, tier_type)
);

CREATE INDEX idx_tool_pricing_tool ON tool_pricing_tiers (tool_id);

-- ----------------------------------------------------------------------------
-- 10. TABLA: tool_safety_requirements (4FN)
-- Requisitos de seguridad y equipos de protección personal (EPP)
-- ----------------------------------------------------------------------------
CREATE TABLE tool_safety_requirements (
    id BIGSERIAL PRIMARY KEY,
    tool_id BIGINT NOT NULL,
    requirement_name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    CONSTRAINT fk_tool_safety_tool FOREIGN KEY (tool_id) REFERENCES tools (id) ON DELETE CASCADE,
    CONSTRAINT uq_tool_safety UNIQUE (tool_id, requirement_name)
);

CREATE INDEX idx_tool_safety_tool ON tool_safety_requirements (tool_id);

-- ----------------------------------------------------------------------------
-- 11. TABLA: reservations
-- Contratos de reserva y alquiler de herramientas
-- ----------------------------------------------------------------------------
CREATE TABLE reservations (
    id BIGSERIAL PRIMARY KEY,
    reservation_code VARCHAR(30) NOT NULL UNIQUE,
    client_id BIGINT NOT NULL,
    tool_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL CHECK (total_days > 0),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    deposit_total NUMERIC(12, 2) NOT NULL CHECK (deposit_total >= 0),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE', -- PENDIENTE, APROBADA, RECHAZADA, EN_CURSO, FINALIZADA, CANCELADA
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_reservation_dates CHECK (end_date >= start_date),
    CONSTRAINT fk_reservations_client FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE RESTRICT,
    CONSTRAINT fk_reservations_tool FOREIGN KEY (tool_id) REFERENCES tools (id) ON DELETE RESTRICT
);

CREATE INDEX idx_reservations_client ON reservations (client_id);
CREATE INDEX idx_reservations_tool ON reservations (tool_id);
CREATE INDEX idx_reservations_dates ON reservations (start_date, end_date);
CREATE INDEX idx_reservations_status ON reservations (status);

-- ----------------------------------------------------------------------------
-- 12. TABLA: payments
-- Registro de transacciones de pago
-- ----------------------------------------------------------------------------
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    transaction_reference VARCHAR(100) NOT NULL UNIQUE,
    reservation_id BIGINT NOT NULL UNIQUE,
    client_id BIGINT NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- TARJETA_CREDITO, PSE, TRANSFERENCIA, PASARELA_SIMULADA
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_status VARCHAR(30) NOT NULL DEFAULT 'COMPLETADO', -- PENDIENTE, COMPLETADO, FALLIDO, REEMBOLSADO
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    gateway_reference VARCHAR(100),
    CONSTRAINT fk_payments_reservation FOREIGN KEY (reservation_id) REFERENCES reservations (id) ON DELETE RESTRICT,
    CONSTRAINT fk_payments_client FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE RESTRICT
);

CREATE INDEX idx_payments_status ON payments (payment_status);

-- ----------------------------------------------------------------------------
-- 13. TABLA: invoices
-- Facturación automática de alquileres
-- ----------------------------------------------------------------------------
CREATE TABLE invoices (
    id BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    reservation_id BIGINT NOT NULL UNIQUE,
    payment_id BIGINT NOT NULL UNIQUE,
    issue_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    tax_amount NUMERIC(12, 2) NOT NULL CHECK (tax_amount >= 0), -- IVA (19%)
    total NUMERIC(12, 2) NOT NULL CHECK (total > 0),
    status VARCHAR(30) NOT NULL DEFAULT 'EMITIDA', -- EMITIDA, ANULADA
    pdf_url TEXT,
    CONSTRAINT fk_invoices_reservation FOREIGN KEY (reservation_id) REFERENCES reservations (id) ON DELETE RESTRICT,
    CONSTRAINT fk_invoices_payment FOREIGN KEY (payment_id) REFERENCES payments (id) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- 14. TABLA: rental_deliveries
-- Acta de entrega inicial de la herramienta en obra o almacén
-- ----------------------------------------------------------------------------
CREATE TABLE rental_deliveries (
    id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT NOT NULL UNIQUE,
    delivery_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delivered_by VARCHAR(150) NOT NULL,
    initial_condition_notes TEXT NOT NULL,
    client_signature_ack BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_deliveries_reservation FOREIGN KEY (reservation_id) REFERENCES reservations (id) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- 15. TABLA: rental_returns
-- Acta de devolución y recepción del equipo
-- ----------------------------------------------------------------------------
CREATE TABLE rental_returns (
    id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT NOT NULL UNIQUE,
    return_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    received_by VARCHAR(150) NOT NULL,
    tool_condition_status VARCHAR(30) NOT NULL, -- EXCELENTE, BUENO, DANADO, INOPERATIVO
    inspection_notes TEXT NOT NULL,
    deposit_refunded BOOLEAN NOT NULL DEFAULT TRUE,
    extra_damage_fee NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (extra_damage_fee >= 0),
    CONSTRAINT fk_returns_reservation FOREIGN KEY (reservation_id) REFERENCES reservations (id) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- 16. TABLA: damage_reports
-- Reporte de daños, averías e incidencias detectadas en la devolución
-- ----------------------------------------------------------------------------
CREATE TABLE damage_reports (
    id BIGSERIAL PRIMARY KEY,
    return_id BIGINT NOT NULL,
    reported_by VARCHAR(150) NOT NULL,
    damage_type VARCHAR(100) NOT NULL, -- MOTOR, ESTRUCTURA, ACCESORIO_FALTANTE, DESGASTE_EXCESIVO
    description TEXT NOT NULL,
    repair_cost_estimate NUMERIC(12, 2) NOT NULL CHECK (repair_cost_estimate >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'EVALUANDO', -- EVALUANDO, COBRADO, CONDONADO
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_damages_return FOREIGN KEY (return_id) REFERENCES rental_returns (id) ON DELETE CASCADE
);

CREATE INDEX idx_damages_return ON damage_reports (return_id);
