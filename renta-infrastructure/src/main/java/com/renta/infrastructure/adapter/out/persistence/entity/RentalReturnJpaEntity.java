package com.renta.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "rental_returns")
public class RentalReturnJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reservation_id", nullable = false, unique = true)
    private Long reservationId;

    @Column(name = "return_date", nullable = false)
    private Instant returnDate = Instant.now();

    @Column(name = "received_by", nullable = false, length = 150)
    private String receivedBy;

    @Column(name = "tool_condition_status", nullable = false, length = 30)
    private String toolConditionStatus;

    @Column(name = "inspection_notes", nullable = false, columnDefinition = "TEXT")
    private String inspectionNotes;

    @Column(name = "deposit_refunded", nullable = false)
    private boolean depositRefunded = true;

    @Column(name = "extra_damage_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal extraDamageFee = BigDecimal.ZERO;

    public RentalReturnJpaEntity() {}

    public RentalReturnJpaEntity(Long id, Long reservationId, Instant returnDate, String receivedBy,
                                 String toolConditionStatus, String inspectionNotes, boolean depositRefunded,
                                 BigDecimal extraDamageFee) {
        this.id = id;
        this.reservationId = reservationId;
        this.returnDate = returnDate != null ? returnDate : Instant.now();
        this.receivedBy = receivedBy;
        this.toolConditionStatus = toolConditionStatus;
        this.inspectionNotes = inspectionNotes;
        this.depositRefunded = depositRefunded;
        this.extraDamageFee = extraDamageFee != null ? extraDamageFee : BigDecimal.ZERO;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getReservationId() { return reservationId; }
    public void setReservationId(Long reservationId) { this.reservationId = reservationId; }
    public Instant getReturnDate() { return returnDate; }
    public void setReturnDate(Instant returnDate) { this.returnDate = returnDate; }
    public String getReceivedBy() { return receivedBy; }
    public void setReceivedBy(String receivedBy) { this.receivedBy = receivedBy; }
    public String getToolConditionStatus() { return toolConditionStatus; }
    public void setToolConditionStatus(String toolConditionStatus) { this.toolConditionStatus = toolConditionStatus; }
    public String getInspectionNotes() { return inspectionNotes; }
    public void setInspectionNotes(String inspectionNotes) { this.inspectionNotes = inspectionNotes; }
    public boolean isDepositRefunded() { return depositRefunded; }
    public void setDepositRefunded(boolean depositRefunded) { this.depositRefunded = depositRefunded; }
    public BigDecimal getExtraDamageFee() { return extraDamageFee; }
    public void setExtraDamageFee(BigDecimal extraDamageFee) { this.extraDamageFee = extraDamageFee; }
}
