-- ============================================================================
-- PLATAFORMA DE RENTA DE HERRAMIENTAS Y EQUIPOS DE CONSTRUCCIÓN
-- BASE DE DATOS: MySQL 8.0+ / MariaDB 10.5+
-- MODELO RELACIONAL NORMALIZADO EN CUARTA FORMA NORMAL (4FN)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS renta_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE renta_db;

-- Desactivar temporalmente revisión de llaves foráneas para borrado en cascada
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS damage_reports;
DROP TABLE IF EXISTS rental_returns;
DROP TABLE IF EXISTS rental_deliveries;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS tool_safety_requirements;
DROP TABLE IF EXISTS tool_pricing_tiers;
DROP TABLE IF EXISTS tool_specifications;
DROP TABLE IF EXISTS tool_images;
DROP TABLE IF EXISTS tools;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS providers;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- 1. TABLA: roles
-- ----------------------------------------------------------------------------
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. TABLA: users
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_users_email ON users (email);

-- ----------------------------------------------------------------------------
-- 3. TABLA: clients
-- ----------------------------------------------------------------------------
CREATE TABLE clients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    document_type ENUM('CC', 'NIT', 'CE', 'PASAPORTE') NOT NULL DEFAULT 'CC',
    document_number VARCHAR(30) NOT NULL UNIQUE,
    phone VARCHAR(25) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_clients_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_clients_doc ON clients (document_number);

-- ----------------------------------------------------------------------------
-- 4. TABLA: providers
-- ----------------------------------------------------------------------------
CREATE TABLE providers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    company_name VARCHAR(150) NOT NULL,
    legal_representative VARCHAR(150) NOT NULL,
    nit_rut VARCHAR(30) NOT NULL UNIQUE,
    phone VARCHAR(25) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_providers_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_providers_nit ON providers (nit_rut);

-- ----------------------------------------------------------------------------
-- 5. TABLA: categories
-- ----------------------------------------------------------------------------
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    icon_name VARCHAR(50) DEFAULT 'wrench',
    active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. TABLA: tools
-- ----------------------------------------------------------------------------
CREATE TABLE tools (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider_id BIGINT NOT NULL,
    category_id INT NOT NULL,
    code_sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    base_daily_price DECIMAL(12,2) NOT NULL,
    deposit_amount DECIMAL(12,2) NOT NULL,
    status ENUM('DISPONIBLE', 'ALQUILADA', 'MANTENIMIENTO', 'RETIRADA') NOT NULL DEFAULT 'DISPONIBLE',
    main_image_url TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tools_provider FOREIGN KEY (provider_id) REFERENCES providers (id) ON DELETE RESTRICT,
    CONSTRAINT fk_tools_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_tools_sku ON tools (code_sku);
CREATE INDEX idx_tools_status ON tools (status);
CREATE INDEX idx_tools_provider ON tools (provider_id);

-- ----------------------------------------------------------------------------
-- 7. TABLA: tool_images (4FN)
-- ----------------------------------------------------------------------------
CREATE TABLE tool_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tool_id BIGINT NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    caption VARCHAR(150),
    CONSTRAINT fk_tool_images_tool FOREIGN KEY (tool_id) REFERENCES tools (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. TABLA: tool_specifications (4FN)
-- ----------------------------------------------------------------------------
CREATE TABLE tool_specifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tool_id BIGINT NOT NULL,
    spec_name VARCHAR(100) NOT NULL,
    spec_value VARCHAR(255) NOT NULL,
    CONSTRAINT fk_tool_specs_tool FOREIGN KEY (tool_id) REFERENCES tools (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. TABLA: tool_pricing_tiers (4FN)
-- ----------------------------------------------------------------------------
CREATE TABLE tool_pricing_tiers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tool_id BIGINT NOT NULL,
    tier_type ENUM('DIARIO', 'SEMANAL', 'MENSUAL') NOT NULL,
    min_days INT NOT NULL,
    price_per_day DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_tool_pricing_tool FOREIGN KEY (tool_id) REFERENCES tools (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 10. TABLA: tool_safety_requirements (4FN)
-- ----------------------------------------------------------------------------
CREATE TABLE tool_safety_requirements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tool_id BIGINT NOT NULL,
    requirement_name VARCHAR(150) NOT NULL,
    description TEXT,
    CONSTRAINT fk_tool_safety_tool FOREIGN KEY (tool_id) REFERENCES tools (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 11. TABLA: reservations
-- ----------------------------------------------------------------------------
CREATE TABLE reservations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reservation_code VARCHAR(30) NOT NULL UNIQUE,
    client_id BIGINT NOT NULL,
    tool_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL,
    daily_price_applied DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) NOT NULL,
    deposit_amount DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    status ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA') NOT NULL DEFAULT 'PENDIENTE',
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reservations_client FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE RESTRICT,
    CONSTRAINT fk_reservations_tool FOREIGN KEY (tool_id) REFERENCES tools (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_reservations_code ON reservations (reservation_code);
CREATE INDEX idx_reservations_dates ON reservations (tool_id, start_date, end_date);
CREATE INDEX idx_reservations_client ON reservations (client_id);

-- ----------------------------------------------------------------------------
-- 12. TABLA: payments
-- ----------------------------------------------------------------------------
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reservation_id BIGINT NOT NULL UNIQUE,
    amount DECIMAL(12,2) NOT NULL,
    payment_method ENUM('TARJETA_CREDITO', 'PSE', 'TRANSFERENCIA', 'EFECTIVO') NOT NULL,
    status ENUM('PENDIENTE', 'COMPLETADO', 'FALLIDO', 'REEMBOLSADO') NOT NULL DEFAULT 'PENDIENTE',
    transaction_reference VARCHAR(100) NOT NULL UNIQUE,
    installment_count INT NOT NULL DEFAULT 1,
    payment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_reservation FOREIGN KEY (reservation_id) REFERENCES reservations (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_payments_ref ON payments (transaction_reference);

-- ----------------------------------------------------------------------------
-- 13. TABLA: invoices (Facturación DIAN con CUFE)
-- ----------------------------------------------------------------------------
CREATE TABLE invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    payment_id BIGINT NOT NULL UNIQUE,
    reservation_id BIGINT NOT NULL,
    cufe VARCHAR(100) NOT NULL UNIQUE,
    client_nit_cc VARCHAR(30) NOT NULL,
    client_name VARCHAR(150) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) NOT NULL,
    deposit_held DECIMAL(12,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    issued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pdf_url TEXT,
    CONSTRAINT fk_invoices_payment FOREIGN KEY (payment_id) REFERENCES payments (id) ON DELETE RESTRICT,
    CONSTRAINT fk_invoices_reservation FOREIGN KEY (reservation_id) REFERENCES reservations (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_invoices_cufe ON invoices (cufe);

-- ----------------------------------------------------------------------------
-- 14. TABLA: rental_deliveries (Actas de Despacho)
-- ----------------------------------------------------------------------------
CREATE TABLE rental_deliveries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reservation_id BIGINT NOT NULL UNIQUE,
    delivery_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    initial_operating_hours INT NOT NULL DEFAULT 0,
    delivery_notes TEXT,
    operator_name VARCHAR(150),
    CONSTRAINT fk_deliveries_reservation FOREIGN KEY (reservation_id) REFERENCES reservations (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 15. TABLA: rental_returns (Actas de Devolución e Inspección)
-- ----------------------------------------------------------------------------
CREATE TABLE rental_returns (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reservation_id BIGINT NOT NULL UNIQUE,
    return_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    final_operating_hours INT NOT NULL,
    return_condition ENUM('BUENO', 'REGULAR', 'DANADO') NOT NULL DEFAULT 'BUENO',
    return_notes TEXT,
    penalty_fee DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_returns_reservation FOREIGN KEY (reservation_id) REFERENCES reservations (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 16. TABLA: damage_reports (Reportes de Siniestro / Avería)
-- ----------------------------------------------------------------------------
CREATE TABLE damage_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rental_return_id BIGINT NOT NULL,
    description TEXT NOT NULL,
    estimated_repair_cost DECIMAL(12,2) NOT NULL,
    severity ENUM('LEVE', 'MODERADO', 'GRAVE') NOT NULL DEFAULT 'LEVE',
    photos_url TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_damages_return FOREIGN KEY (rental_return_id) REFERENCES rental_returns (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 17. TABLA: reviews (Calificaciones y Reseñas)
-- ----------------------------------------------------------------------------
CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tool_id BIGINT NOT NULL,
    client_id BIGINT NOT NULL,
    reservation_id BIGINT UNIQUE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_tool FOREIGN KEY (tool_id) REFERENCES tools (id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_client FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_reservation FOREIGN KEY (reservation_id) REFERENCES reservations (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_reviews_tool ON reviews (tool_id);
