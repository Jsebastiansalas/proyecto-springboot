-- Crear la tabla tool_maintenances que mapea a ToolMaintenanceJpaEntity
CREATE TABLE IF NOT EXISTS tool_maintenances (
    id BIGSERIAL PRIMARY KEY,
    tool_id BIGINT NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    cost NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
    technician_name VARCHAR(150),
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'EN_PROCESO',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tool_maintenances_tool ON tool_maintenances(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_maintenances_status ON tool_maintenances(status);

-- Sembrar registros de prueba para demostración inmediata
INSERT INTO tool_maintenances (tool_id, maintenance_type, start_date, end_date, cost, technician_name, description, status, created_at)
VALUES 
(1, 'PREVENTIVO', CURRENT_DATE - 15, CURRENT_DATE - 14, 85000.00, 'Ing. Gustavo Morales', 'Mantenimiento preventivo 200h: engrase percusor y cambio carbones.', 'FINALIZADO', CURRENT_TIMESTAMP - INTERVAL '15 days'),
(2, 'CORRECTIVO', CURRENT_DATE - 8, CURRENT_DATE - 6, 215000.00, 'Téc. Jairo Benítez', 'Calibración de embrague centrífugo y resortes de zapata compactadora.', 'FINALIZADO', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(4, 'CALIBRACION', CURRENT_DATE - 1, CURRENT_DATE + 2, 150000.00, 'Ing. Gustavo Morales', 'Calibración de telemetría y pruebas de aislamiento dieléctrico RETIE.', 'EN_PROCESO', CURRENT_TIMESTAMP - INTERVAL '1 day')
ON CONFLICT DO NOTHING;
