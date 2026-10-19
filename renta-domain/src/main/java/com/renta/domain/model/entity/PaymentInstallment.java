package com.renta.domain.model.entity;

import com.renta.domain.model.enums.PaymentInstallmentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;

/**
 * Domain entity representing an individual installment in a financing payment schedule (4FN).
 */
public class PaymentInstallment {

    private Long id;
    private Long paymentId;
    private Long reservationId;
    private Integer installmentNumber;
    private Integer totalInstallments;
    private LocalDate dueDate;
    private BigDecimal principalAmount;
    private BigDecimal interestAmount;
    private BigDecimal totalInstallmentAmount;
    private PaymentInstallmentStatus status;
    private Instant paidAt;
    private String transactionRef;

    public PaymentInstallment() {
    }

    public PaymentInstallment(Long id, Long paymentId, Long reservationId,
                              Integer installmentNumber, Integer totalInstallments,
                              LocalDate dueDate, BigDecimal principalAmount,
                              BigDecimal interestAmount, BigDecimal totalInstallmentAmount,
                              PaymentInstallmentStatus status, Instant paidAt, String transactionRef) {
        this.id = id;
        this.paymentId = paymentId;
        this.reservationId = reservationId;
        this.installmentNumber = installmentNumber;
        this.totalInstallments = totalInstallments;
        this.dueDate = dueDate;
        this.principalAmount = principalAmount != null ? principalAmount : BigDecimal.ZERO;
        this.interestAmount = interestAmount != null ? interestAmount : BigDecimal.ZERO;
        this.totalInstallmentAmount = totalInstallmentAmount != null ? totalInstallmentAmount : this.principalAmount.add(this.interestAmount);
        this.status = status != null ? status : PaymentInstallmentStatus.PENDIENTE;
        this.paidAt = paidAt;
        this.transactionRef = transactionRef;
    }

    public void markPaid(String transactionRef, Instant paidAt) {
        this.status = PaymentInstallmentStatus.PAGADA;
        this.transactionRef = transactionRef;
        this.paidAt = paidAt != null ? paidAt : Instant.now();
    }

    public boolean isPaid() {
        return this.status == PaymentInstallmentStatus.PAGADA;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public Long getReservationId() {
        return reservationId;
    }

    public void setReservationId(Long reservationId) {
        this.reservationId = reservationId;
    }

    public Integer getInstallmentNumber() {
        return installmentNumber;
    }

    public void setInstallmentNumber(Integer installmentNumber) {
        this.installmentNumber = installmentNumber;
    }

    public Integer getTotalInstallments() {
        return totalInstallments;
    }

    public void setTotalInstallments(Integer totalInstallments) {
        this.totalInstallments = totalInstallments;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public BigDecimal getPrincipalAmount() {
        return principalAmount;
    }

    public void setPrincipalAmount(BigDecimal principalAmount) {
        this.principalAmount = principalAmount;
    }

    public BigDecimal getInterestAmount() {
        return interestAmount;
    }

    public void setInterestAmount(BigDecimal interestAmount) {
        this.interestAmount = interestAmount;
    }

    public BigDecimal getTotalInstallmentAmount() {
        return totalInstallmentAmount;
    }

    public void setTotalInstallmentAmount(BigDecimal totalInstallmentAmount) {
        this.totalInstallmentAmount = totalInstallmentAmount;
    }

    public PaymentInstallmentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentInstallmentStatus status) {
        this.status = status;
    }

    public Instant getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(Instant paidAt) {
        this.paidAt = paidAt;
    }

    public String getTransactionRef() {
        return transactionRef;
    }

    public void setTransactionRef(String transactionRef) {
        this.transactionRef = transactionRef;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PaymentInstallment that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "PaymentInstallment{" +
                "id=" + id +
                ", paymentId=" + paymentId +
                ", installmentNumber=" + installmentNumber +
                ", total=" + totalInstallments +
                ", amount=" + totalInstallmentAmount +
                ", status=" + status +
                '}';
    }
}
