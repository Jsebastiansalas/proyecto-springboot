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
@Table(name = "payments")
public class PaymentJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_reference", nullable = false, unique = true, length = 100)
    private String transactionReference;

    @Column(name = "reservation_id", nullable = false, unique = true)
    private Long reservationId;

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "payment_method", nullable = false, length = 50)
    private String paymentMethod;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_status", nullable = false, length = 30)
    private String paymentStatus = "COMPLETADO";

    @Column(name = "payment_date", nullable = false)
    private Instant paymentDate = Instant.now();

    @Column(name = "gateway_reference", length = 100)
    private String gatewayReference;

    @Column(name = "installment_count", nullable = false)
    private Integer installmentCount = 1;

    @Column(name = "paid_installments", nullable = false)
    private Integer paidInstallments = 1;

    @Column(name = "monthly_interest_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal monthlyInterestRate = BigDecimal.ZERO;

    public PaymentJpaEntity() {}

    public PaymentJpaEntity(Long id, String transactionReference, Long reservationId, Long clientId,
                            String paymentMethod, BigDecimal amount, String paymentStatus,
                            Instant paymentDate, String gatewayReference,
                            Integer installmentCount, Integer paidInstallments, BigDecimal monthlyInterestRate) {
        this.id = id;
        this.transactionReference = transactionReference;
        this.reservationId = reservationId;
        this.clientId = clientId;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
        this.paymentStatus = paymentStatus != null ? paymentStatus : "COMPLETADO";
        this.paymentDate = paymentDate != null ? paymentDate : Instant.now();
        this.gatewayReference = gatewayReference;
        this.installmentCount = installmentCount != null ? installmentCount : 1;
        this.paidInstallments = paidInstallments != null ? paidInstallments : 1;
        this.monthlyInterestRate = monthlyInterestRate != null ? monthlyInterestRate : BigDecimal.ZERO;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTransactionReference() { return transactionReference; }
    public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }
    public Long getReservationId() { return reservationId; }
    public void setReservationId(Long reservationId) { this.reservationId = reservationId; }
    public Long getClientId() { return clientId; }
    public void setClientId(Long clientId) { this.clientId = clientId; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public Instant getPaymentDate() { return paymentDate; }
    public void setPaymentDate(Instant paymentDate) { this.paymentDate = paymentDate; }
    public String getGatewayReference() { return gatewayReference; }
    public void setGatewayReference(String gatewayReference) { this.gatewayReference = gatewayReference; }
    public Integer getInstallmentCount() { return installmentCount; }
    public void setInstallmentCount(Integer installmentCount) { this.installmentCount = installmentCount; }
    public Integer getPaidInstallments() { return paidInstallments; }
    public void setPaidInstallments(Integer paidInstallments) { this.paidInstallments = paidInstallments; }
    public BigDecimal getMonthlyInterestRate() { return monthlyInterestRate; }
    public void setMonthlyInterestRate(BigDecimal monthlyInterestRate) { this.monthlyInterestRate = monthlyInterestRate; }
}
