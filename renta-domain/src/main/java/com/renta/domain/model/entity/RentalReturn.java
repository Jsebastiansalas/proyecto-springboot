package com.renta.domain.model.entity;

import com.renta.domain.model.enums.ToolConditionStatus;
import com.renta.domain.model.vo.Money;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * Domain entity representing the return, technical inspection, and deposit liquidation of rented equipment.
 */
public class RentalReturn {
    private Long id;
    private Long reservationId;
    private Instant returnDate;
    private String receivedBy;
    private ToolConditionStatus toolConditionStatus;
    private String inspectionNotes;
    private boolean depositRefunded = true;
    private Money extraDamageFee = Money.zero();

    public RentalReturn() {
    }

    public RentalReturn(Long id, Long reservationId, Instant returnDate, String receivedBy,
                        ToolConditionStatus toolConditionStatus, String inspectionNotes,
                        boolean depositRefunded, Money extraDamageFee) {
        this.id = id;
        this.reservationId = reservationId;
        this.returnDate = returnDate != null ? returnDate : Instant.now();
        this.receivedBy = receivedBy;
        this.toolConditionStatus = toolConditionStatus;
        this.inspectionNotes = inspectionNotes;
        this.depositRefunded = depositRefunded;
        this.extraDamageFee = extraDamageFee != null ? extraDamageFee : Money.zero();
    }

    public RentalReturn(Long id, Long reservationId, Instant returnDate, String receivedBy,
                        ToolConditionStatus toolConditionStatus, String inspectionNotes,
                        boolean depositRefunded, BigDecimal extraDamageFee) {
        this(id, reservationId, returnDate, receivedBy, toolConditionStatus, inspectionNotes,
                depositRefunded, extraDamageFee != null ? Money.cop(extraDamageFee) : Money.zero());
    }

    public static RentalReturn create(Long reservationId, String receivedBy,
                                       ToolConditionStatus status, String notes,
                                       boolean depositRefunded, Money extraDamageFee) {
        return new RentalReturn(null, reservationId, Instant.now(), receivedBy, status, notes, depositRefunded, extraDamageFee);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getReservationId() {
        return reservationId;
    }

    public void setReservationId(Long reservationId) {
        this.reservationId = reservationId;
    }

    public Instant getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(Instant returnDate) {
        this.returnDate = returnDate;
    }

    public String getReceivedBy() {
        return receivedBy;
    }

    public void setReceivedBy(String receivedBy) {
        this.receivedBy = receivedBy;
    }

    public ToolConditionStatus getToolConditionStatus() {
        return toolConditionStatus;
    }

    public void setToolConditionStatus(ToolConditionStatus toolConditionStatus) {
        this.toolConditionStatus = toolConditionStatus;
    }

    public String getInspectionNotes() {
        return inspectionNotes;
    }

    public void setInspectionNotes(String inspectionNotes) {
        this.inspectionNotes = inspectionNotes;
    }

    public boolean isDepositRefunded() {
        return depositRefunded;
    }

    public void setDepositRefunded(boolean depositRefunded) {
        this.depositRefunded = depositRefunded;
    }

    public Money getExtraDamageFee() {
        return extraDamageFee;
    }

    public void setExtraDamageFee(Money extraDamageFee) {
        this.extraDamageFee = extraDamageFee;
    }

    public void setExtraDamageFee(BigDecimal extraDamageFee) {
        this.extraDamageFee = extraDamageFee != null ? Money.cop(extraDamageFee) : Money.zero();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RentalReturn that)) return false;
        return Objects.equals(id, that.id) || Objects.equals(reservationId, that.reservationId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, reservationId);
    }

    @Override
    public String toString() {
        return "RentalReturn{" + "id=" + id + ", reservationId=" + reservationId + ", condition=" + toolConditionStatus + '}';
    }
}
