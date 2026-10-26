-- ============================================================================
-- NUEVAS FUNCIONALIDADES EXAMEN: MANTENIMIENTO TÉCNICO Y CHECKLIST RETIE 4FN
-- ============================================================================

-- 1. Tabla de Órdenes de Mantenimiento Técnico de Maquinaria
CREATE TABLE IF NOT EXISTS tool_maintenance_orders (
    id BIGSERIAL PRIMARY KEY,
    tool_id BIGINT NOT NULL,
    provider_id BIGINT NOT NULL,
    order_type VARCHAR(50) NOT NULL, -- PREVENTIVO, CORRECTIVO, CALIBRACION_RETIE
    description TEXT NOT NULL,
    technician_name VARCHAR(150) NOT NULL,
    estimated_cost NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (estimated_cost >= 0),
    actual_cost NUMERIC(12, 2) DEFAULT 0 CHECK (actual_cost >= 0),
    horometer_at_service INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'EN_TALLER', -- EN_TALLER, FINALIZADO, CANCELADO
    diagnosis TEXT,
    parts_replaced TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_maintenance_tool FOREIGN KEY (tool_id) REFERENCES tools (id) ON DELETE CASCADE,
    CONSTRAINT fk_maintenance_provider FOREIGN KEY (provider_id) REFERENCES providers (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_maintenance_tool ON tool_maintenance_orders (tool_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_provider ON tool_maintenance_orders (provider_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON tool_maintenance_orders (status);

-- 2. Tabla de Checklist Técnico RETIE de Despacho Logístico
CREATE TABLE IF NOT EXISTS delivery_technical_checklists (
    id BIGSERIAL PRIMARY KEY,
    delivery_id BIGINT NOT NULL UNIQUE,
    cables_inspected BOOLEAN NOT NULL DEFAULT TRUE,
    safety_guards_ok BOOLEAN NOT NULL DEFAULT TRUE,
    retie_certified BOOLEAN NOT NULL DEFAULT TRUE,
    fluids_level_ok BOOLEAN NOT NULL DEFAULT TRUE,
    operator_ppe_kit_included BOOLEAN NOT NULL DEFAULT TRUE,
    inspector_signature VARCHAR(150) NOT NULL DEFAULT 'Inspector Técnico de Patio',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_checklist_delivery FOREIGN KEY (delivery_id) REFERENCES rental_deliveries (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_checklist_delivery ON delivery_technical_checklists (delivery_id);

-- 3. Seed inicial de órdenes de mantenimiento para demostración en examen
INSERT INTO tool_maintenance_orders (tool_id, provider_id, order_type, description, technician_name, estimated_cost, actual_cost, horometer_at_service, status, diagnosis, parts_replaced, created_at, completed_at)
VALUES
(1, 1, 'PREVENTIVO', 'Mantenimiento preventivo de 200 horas: engrase de caja de percusión y cambio de carbones.', 'Ing. Gustavo Morales', 85000.00, 85000.00, 210, 'FINALIZADO', 'Mecanismo de impacto en excelente estado, carbones desgastados al 80%.', 'Juego de carbones originales Bosch, grasa grafitada de alta temperatura.', NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days'),
(2, 2, 'CORRECTIVO', 'Reparación de embrague centrífugo y calibración de resortes de zapata compactadora.', 'Téc. Jairo Benítez', 220000.00, 215000.00, 340, 'FINALIZADO', 'Fricción excesiva en zapatas por ingreso de material granular.', 'Juego de resortes templados, zapatas de fricción Wacker.', NOW() - INTERVAL '8 days', NOW() - INTERVAL '6 days'),
(4, 1, 'PREVENTIVO', 'Inspección de lámparas LED y calibración del generador auxiliar diésel.', 'Ing. Gustavo Morales', 150000.00, 0.00, 180, 'EN_TALLER', 'En proceso de pruebas de aislamiento eléctrico RETIE.', NULL, NOW() - INTERVAL '1 day', NULL);
