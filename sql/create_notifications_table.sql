CREATE TABLE IF NOT EXISTS user_notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'SISTEMA',
    is_read BOOLEAN NOT NULL DEFAULT false,
    link_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON user_notifications(user_id, is_read);

-- Semilla de notificaciones para pruebas inmediatas
INSERT INTO user_notifications (user_id, title, message, type, is_read, link_url, created_at)
VALUES 
(1, '⚠️ Alerta de Vencimiento de Alquiler', 'Tu contrato RES-2026-0042 (Rotomartillo SDS Max) vence en menos de 24 horas. Recuerda solicitar prórroga o coordinar la recolección en patio.', 'ALERTA_VENCIMIENTO', false, '/client-portal', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(1, '✅ Checklist RETIE Aprobado', 'Se ha emitido el Acta Técnica 4FN para tu despacho de Generador Caterpillar. El certificado está disponible para impresión.', 'ESTADO_RESERVA', false, '/client-portal', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(1, '⭐ Califica tu experiencia', 'Tu alquiler de Mezcladora de Concreto ha finalizado exitosamente. ¡Deja tu calificación y reseña técnica para la comunidad!', 'SISTEMA', true, '/client-portal', CURRENT_TIMESTAMP - INTERVAL '3 days')
ON CONFLICT DO NOTHING;
