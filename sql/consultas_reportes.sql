-- ============================================================================
-- PLATAFORMA RENTAMAQ - CONSULTAS SQL ANALÍTICAS, REPORTES Y VISTAS DE VENTAS
-- Base de datos: renta_db (PostgreSQL 16+)
-- ============================================================================
-- Este script contiene las consultas gerenciales y fiscales indispensables para
-- supervisar las ventas, facturación DIAN, recaudo de IVA, rendimiento de proveedores,
-- rotación de maquinaria y garantías en la plataforma.
-- ============================================================================

-- ============================================================================
-- SECCIÓN 1: VISTAS PERMANENTES PARA REPORTES (VIEWS)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1.1 VISTA: Resumen Global de Ventas y Recaudo Financiero
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_resumen_ventas_global AS
SELECT 
    COUNT(i.id) AS total_facturas_emitidas,
    COUNT(DISTINCT r.client_id) AS total_clientes_compradores,
    SUM(i.subtotal) AS subtotal_neto_cop,
    SUM(i.tax_amount) AS total_iva_recaudado_19_cop,
    SUM(i.total) AS total_facturado_general_cop,
    COALESCE(SUM(r.deposit_total), 0) AS total_depositos_garantia_cop,
    ROUND(AVG(i.total), 2) AS ticket_promedio_alquiler_cop
FROM invoices i
JOIN reservations r ON i.reservation_id = r.id
WHERE i.status = 'EMITIDA';

-- ----------------------------------------------------------------------------
-- 1.2 VISTA: Ventas Históricas Agrupadas por Mes (Año-Mes)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_ventas_mensuales AS
SELECT 
    TO_CHAR(i.issue_date, 'YYYY-MM') AS periodo_mes,
    COUNT(i.id) AS cantidad_facturas,
    SUM(i.subtotal) AS subtotal_mes_cop,
    SUM(i.tax_amount) AS iva_recaudado_mes_cop,
    SUM(i.total) AS total_ventas_mes_cop
FROM invoices i
WHERE i.status = 'EMITIDA'
GROUP BY TO_CHAR(i.issue_date, 'YYYY-MM')
ORDER BY periodo_mes DESC;

-- ----------------------------------------------------------------------------
-- 1.3 VISTA: Detalle Completo de Facturación con Cliente y Maquinaria
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_facturacion_detallada AS
SELECT 
    i.invoice_number AS numero_factura,
    TO_CHAR(i.issue_date, 'YYYY-MM-DD HH24:MI') AS fecha_emision,
    CONCAT(c.first_name, ' ', c.last_name) AS cliente_nombre,
    CONCAT(c.document_type, ': ', c.document_number) AS cliente_identificacion,
    c.phone AS cliente_telefono,
    c.city AS cliente_ciudad,
    t.code_sku AS sku_herramienta,
    t.name AS herramienta,
    p.company_name AS empresa_proveedora,
    r.reservation_code AS codigo_reserva,
    r.total_days AS dias_alquiler,
    r.start_date AS fecha_inicio,
    r.end_date AS fecha_fin,
    pay.payment_method AS metodo_pago,
    pay.transaction_reference AS referencia_pago,
    i.subtotal AS subtotal_cop,
    i.tax_amount AS iva_19_cop,
    i.total AS total_pagado_cop,
    i.status AS estado_factura
FROM invoices i
JOIN reservations r ON i.reservation_id = r.id
JOIN clients c ON r.client_id = c.id
JOIN tools t ON r.tool_id = t.id
JOIN providers p ON t.provider_id = p.id
JOIN payments pay ON i.payment_id = pay.id
ORDER BY i.issue_date DESC;

-- ----------------------------------------------------------------------------
-- 1.4 VISTA: Ranking de Herramientas Más Alquiladas y Mayor Rentabilidad
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_top_herramientas_rentadas AS
SELECT 
    t.id AS tool_id,
    t.code_sku,
    t.name AS herramienta,
    t.brand AS marca,
    cat.name AS categoria,
    p.company_name AS proveedor,
    COUNT(r.id) AS total_alquileres,
    SUM(r.total_days) AS total_dias_en_obra,
    t.base_daily_price AS tarifa_diaria_base,
    COALESCE(SUM(r.subtotal), 0) AS ingresos_generados_cop,
    t.status AS estado_actual
FROM tools t
JOIN categories cat ON t.category_id = cat.id
JOIN providers p ON t.provider_id = p.id
LEFT JOIN reservations r ON t.id = r.tool_id AND r.status IN ('APROBADA', 'EN_CURSO', 'FINALIZADA')
GROUP BY t.id, t.code_sku, t.name, t.brand, cat.name, p.company_name, t.base_daily_price, t.status
ORDER BY ingresos_generados_cop DESC, total_alquileres DESC;

-- ----------------------------------------------------------------------------
-- 1.5 VISTA: Rendimiento Financiero por Empresa Proveedora
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_rendimiento_proveedores AS
SELECT 
    p.id AS provider_id,
    p.company_name AS empresa_proveedora,
    p.nit_rut AS nit,
    p.city AS ciudad_bodega,
    p.verified AS proveedor_verificado,
    COUNT(DISTINCT t.id) AS total_herramientas_catalogo,
    COUNT(DISTINCT r.id) AS total_alquileres_atendidos,
    COALESCE(SUM(r.subtotal), 0) AS facturacion_total_equipos_cop
FROM providers p
LEFT JOIN tools t ON p.id = t.provider_id
LEFT JOIN reservations r ON t.id = r.tool_id AND r.status IN ('APROBADA', 'EN_CURSO', 'FINALIZADA')
GROUP BY p.id, p.company_name, p.nit_rut, p.city, p.verified
ORDER BY facturacion_total_equipos_cop DESC;

-- ----------------------------------------------------------------------------
-- 1.6 VISTA: Top Clientes con Mayor Gasto y Frecuencia
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_clientes_frecuentes AS
SELECT 
    c.id AS client_id,
    CONCAT(c.first_name, ' ', c.last_name) AS cliente,
    c.document_number AS documento,
    c.city AS ciudad,
    COUNT(r.id) AS cantidad_reservas,
    COALESCE(SUM(r.subtotal), 0) AS total_invertido_alquiler_cop
FROM clients c
JOIN reservations r ON c.id = r.client_id AND r.status IN ('APROBADA', 'EN_CURSO', 'FINALIZADA')
GROUP BY c.id, c.first_name, c.last_name, c.document_number, c.city
ORDER BY total_invertido_alquiler_cop DESC, cantidad_reservas DESC;

-- ----------------------------------------------------------------------------
-- 1.7 VISTA: Control de Garantías y Reporte de Averías en Retornos
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_control_garantias_averias AS
SELECT 
    ret.id AS id_devolucion,
    r.reservation_code AS codigo_reserva,
    t.name AS equipo,
    CONCAT(c.first_name, ' ', c.last_name) AS cliente,
    r.deposit_total AS garantia_inicial_retenida,
    ret.tool_condition_status AS condicion_al_devolver,
    ret.deposit_refunded AS garantia_devuelta,
    ret.extra_damage_fee AS cobro_adicional_danos,
    dr.damage_type AS tipo_dano,
    dr.repair_cost_estimate AS costo_estimado_reparacion
FROM rental_returns ret
JOIN reservations r ON ret.reservation_id = r.id
JOIN tools t ON r.tool_id = t.id
JOIN clients c ON r.client_id = c.id
LEFT JOIN damage_reports dr ON ret.id = dr.return_id
ORDER BY ret.return_date DESC;


-- ============================================================================
-- SECCIÓN 2: FUNCIÓN PL/pgSQL PARA FILTRAR VENTAS POR RANGO DE FECHAS
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_calcular_ventas_periodo(
    p_fecha_inicio DATE,
    p_fecha_fin DATE
)
RETURNS TABLE (
    total_facturas BIGINT,
    subtotal_periodo NUMERIC,
    iva_recaudado NUMERIC,
    total_recaudo NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(i.id)::BIGINT,
        COALESCE(SUM(i.subtotal), 0)::NUMERIC,
        COALESCE(SUM(i.tax_amount), 0)::NUMERIC,
        COALESCE(SUM(i.total), 0)::NUMERIC
    FROM invoices i
    WHERE i.issue_date::DATE BETWEEN p_fecha_inicio AND p_fecha_fin
      AND i.status = 'EMITIDA';
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- SECCIÓN 3: CONSULTAS DIRECTAS DE EJECUCIÓN RÁPIDA (QUERIES DE PRUEBA)
-- ============================================================================

-- 1. Ver el gran total de ventas de la plataforma:
-- SELECT * FROM vw_resumen_ventas_global;

-- 2. Ver la evolución de ventas mes a mes:
-- SELECT * FROM vw_ventas_mensuales;

-- 3. Ver las 10 facturas más recientes con cliente y herramienta:
-- SELECT * FROM vw_facturacion_detallada LIMIT 10;

-- 4. Ver el Top 5 de maquinaria más rentable:
-- SELECT * FROM vw_top_herramientas_rentadas LIMIT 5;

-- 5. Ver el ranking de proveedores por facturación:
-- SELECT * FROM vw_rendimiento_proveedores;

-- 6. Ver el Top 5 de clientes que más contratan:
-- SELECT * FROM vw_clientes_frecuentes LIMIT 5;

-- 7. Consultar ventas entre dos fechas específicas usando la función:
-- SELECT * FROM fn_calcular_ventas_periodo('2026-01-01', '2026-12-31');
