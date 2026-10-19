package com.renta.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "payment_installments")
public class PaymentInstallmentJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payment_id", nullable = false)
    private Long paymentId;

    @Column(name = "reservation_id", nullable = false)
    private Long reservationId;

    @Column(name = "installment_number", nullable = false)
    private Integer installmentNumber;

    @Column(name = "total_installments", nullable = false)
    private Integer totalInstallments;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "principal_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal principalAmount;

    @Column(name = "interest_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal interestAmount = BigDecimal.ZERO;

    @Column(name = "total_installment_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalInstallmentAmount;

    @Column(nullable = false, length = 30)
    private String status = "PENDIENTE";

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "transaction_ref", length = 100)
    private String transactionRef;

    public PaymentInstallmentJpaEntity() {}

    public PaymentInstallmentJpaEntity(Long id, Long paymentId, Long reservationId,
                                      Integer installmentNumber, Integer totalInstallments,
                                      LocalDate dueDate, BigDecimal principalAmount,
                                      BigDecimal interestAmount, BigDecimal totalInstallmentAmount,
                                      String status, Instant paidAt, String transactionRef) {
        this.id = id;
        this.paymentId = paymentId;
        this.reservationId = reservationId;
        this.installmentNumber = installmentNumber;
        this.totalInstallments = totalInstallments;
        this.dueDate = dueDate;
        this.principalAmount = principalAmount;
        this.interestAmount = interestAmount;
        this.totalInstallmentAmount = totalInstallmentAmount;
        this.status = status != null ? status : "PENDIENTE";
        this.paidAt = paidAt;
        this.transactionRef = transactionRef;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }
    public Long getReservationId() { return reservationId; }
    public void setReservationId(Long reservationId) { this.reservationId = reservationId; }
    public Integer getInstallmentNumber() { return installmentNumber; }
    public void setInstallmentNumber(Integer installmentNumber) { this.installmentNumber = installmentNumber; }
    public Integer getTotalInstallments() { return totalInstallments; }
    public void setTotalInstallments(Integer totalInstallments) { this.totalInstallments = totalInstallments; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public BigDecimal getPrincipalAmount() { return principalAmount; }
    public void setPrincipalAmount(BigDecimal principalAmount) { this.principalAmount = principalAmount; }
    public BigDecimal getInterestAmount() { return interestAmount; }
    public void setInterestAmount(BigDecimal interestAmount) { this.interestAmount = interestAmount; }
    public BigDecimal getTotalInstallmentAmount() { return totalInstallmentAmount; }
    public void setTotalInstallmentAmount(BigDecimal totalInstallmentAmount) { this.totalInstallmentAmount = totalInstallmentAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getPaidAt() { return paidAt; }
    public void setPaidAt(Instant paidAt) { this.paidAt = paidAt; }
    public String getTransactionRef() { return transactionRef; }
    public void setTransactionRef(String transactionRef) { this.transactionRef = transactionRef; }
}
