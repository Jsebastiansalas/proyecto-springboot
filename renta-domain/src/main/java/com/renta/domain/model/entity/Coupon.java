package com.renta.domain.model.entity;

import com.renta.domain.exception.BusinessRuleViolationException;
import com.renta.domain.model.vo.Money;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

/**
 * ============================================================================
 * ENTIDAD DE DOMINIO: CUPÓN DE DESCUENTO (Coupon)
 * ============================================================================
 * Modela un cupón promocional en el negocio de alquileres.
 * 100% Java Estándar (DDD Puro, sin anotaciones de persistencia ni Spring).
 */
public class Coupon {

    private Long id;
    private String code;
    private String description;
    private BigDecimal discountPercentage;
    private BigDecimal maxDiscountAmount;
    private LocalDate expirationDate;
    private int minRentalDays;
    private int maxUses;
    private int currentUses;
    private boolean active;

    public Coupon() {
    }

    public Coupon(Long id, String code, String description, BigDecimal discountPercentage,
                  BigDecimal maxDiscountAmount, LocalDate expirationDate, int minRentalDays,
                  int maxUses, int currentUses, boolean active) {
        this.id = id;
        this.code = Objects.requireNonNull(code, "El código del cupón no puede ser nulo").trim().toUpperCase();
        this.description = description;
        this.discountPercentage = discountPercentage != null ? discountPercentage : BigDecimal.ZERO;
        this.maxDiscountAmount = maxDiscountAmount;
        this.expirationDate = Objects.requireNonNull(expirationDate, "La fecha de expiración es obligatoria");
        this.minRentalDays = Math.max(1, minRentalDays);
        this.maxUses = maxUses > 0 ? maxUses : Integer.MAX_VALUE;
        this.currentUses = Math.max(0, currentUses);
        this.active = active;
    }

    /**
     * Valida si el cupón está vigente y cumple con las condiciones mínimas del alquiler.
     */
    public void validateApplicability(LocalDate referenceDate, int rentalDays, Money subtotal) {
        if (!this.active) {
            throw new BusinessRuleViolationException(String.format("El cupón '%s' se encuentra inactivo.", this.code));
        }

        if (referenceDate.isAfter(this.expirationDate)) {
            throw new BusinessRuleViolationException(
                    String.format("El cupón '%s' expiró el %s.", this.code, this.expirationDate)
            );
        }

        if (this.currentUses >= this.maxUses) {
            throw new BusinessRuleViolationException(
                    String.format("El cupón '%s' ha alcanzado el límite máximo de usos permitidos.", this.code)
            );
        }

        if (rentalDays < this.minRentalDays) {
            throw new BusinessRuleViolationException(
                    String.format("El cupón '%s' requiere un alquiler mínimo de %d días (solicitado: %d días).",
                            this.code, this.minRentalDays, rentalDays)
            );
        }
    }

    /**
     * Calcula el monto monetario exacto del descuento aplicable a un subtotal.
     */
    public Money calculateDiscount(Money subtotal) {
        if (subtotal == null || subtotal.isZero() || this.discountPercentage.compareTo(BigDecimal.ZERO) <= 0) {
            return Money.zero();
        }

        BigDecimal factor = this.discountPercentage.divide(BigDecimal.valueOf(100));
        BigDecimal calculated = subtotal.amount().multiply(factor);

        if (this.maxDiscountAmount != null && calculated.compareTo(this.maxDiscountAmount) > 0) {
            calculated = this.maxDiscountAmount;
        }

        return Money.of(calculated);
    }

    /**
     * Incrementa el contador de usos del cupón.
     */
    public void recordUsage() {
        if (this.currentUses >= this.maxUses) {
            throw new BusinessRuleViolationException("No se puede utilizar un cupón agotado.");
        }
        this.currentUses++;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code != null ? code.trim().toUpperCase() : null; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(BigDecimal discountPercentage) { this.discountPercentage = discountPercentage; }

    public BigDecimal getMaxDiscountAmount() { return maxDiscountAmount; }
    public void setMaxDiscountAmount(BigDecimal maxDiscountAmount) { this.maxDiscountAmount = maxDiscountAmount; }

    public LocalDate getExpirationDate() { return expirationDate; }
    public void setExpirationDate(LocalDate expirationDate) { this.expirationDate = expirationDate; }

    public int getMinRentalDays() { return minRentalDays; }
    public void setMinRentalDays(int minRentalDays) { this.minRentalDays = minRentalDays; }

    public int getMaxUses() { return maxUses; }
    public void setMaxUses(int maxUses) { this.maxUses = maxUses; }

    public int getCurrentUses() { return currentUses; }
    public void setCurrentUses(int currentUses) { this.currentUses = currentUses; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
