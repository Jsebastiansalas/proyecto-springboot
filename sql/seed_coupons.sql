-- Seed coupons para demostración de examen
CREATE TABLE IF NOT EXISTS discount_coupons (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    discount_percentage NUMERIC(5, 2) NOT NULL,
    max_discount_amount NUMERIC(12, 2),
    expiration_date DATE NOT NULL,
    min_rental_days INT NOT NULL DEFAULT 1,
    max_uses INT NOT NULL DEFAULT 1000,
    current_uses INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON discount_coupons (code);

INSERT INTO discount_coupons (code, description, discount_percentage, max_discount_amount, expiration_date, min_rental_days, max_uses, current_uses, is_active)
VALUES
('OBRAS2026', 'Cupón institucional para cuadrillas de obra (15% OFF)', 15.00, 300000.00, '2028-12-31', 1, 500, 0, TRUE),
('EXAMEN10', 'Descuento especial de evaluación académica (10% OFF)', 10.00, 150000.00, '2028-12-31', 1, 1000, 0, TRUE),
('PROMO20', 'Descuento por fidelidad de contratista (20% OFF)', 20.00, 500000.00, '2028-12-31', 3, 200, 0, TRUE)
ON CONFLICT (code) DO NOTHING;
