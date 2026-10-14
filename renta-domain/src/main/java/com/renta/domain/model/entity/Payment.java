package com.renta.domain.model.entity;

import com.renta.domain.model.enums.PaymentMethod;
import com.renta.domain.model.enums.PaymentStatus;
import com.renta.domain.model.vo.Money;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * Domain entity representing a financial payment transaction linked to a reservation.
 */
public class Payment {
    private Long id;
    private String transactionReference;
    private Long reservationId;
    private Long clientId;
    private PaymentMethod paymentMethod;
    private Money amount;
    private PaymentStatus paymentStatus = PaymentStatus.PENDIENTE;
    private Instant paymentDate;
    private String gatewayReference;

    public Payment() {
    }

    public Payment(Long id, String transactionReference, Long reservationId, Long clientId,
                   PaymentMethod paymentMethod, Money amount, PaymentStatus paymentStatus,
                   Instant paymentDate, String gatewayReference) {
        this.id = id;
        this.transactionReference = transactionReference;
        this.reservationId = reservationId;
        this.clientId = clientId;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
        this.paymentStatus = paymentStatus != null ? paymentStatus : PaymentStatus.PENDIENTE;
        this.paymentDate = paymentDate != null ? paymentDate : Instant.now();
        this.gatewayReference = gatewayReference;
    }

    public Payment(Long id, String transactionReference, Long reservationId, Long clientId,
                   PaymentMethod paymentMethod, BigDecimal amount, PaymentStatus paymentStatus,
                   Instant paymentDate, String gatewayReference) {
        this(id, transactionReference, reservationId, clientId, paymentMethod,
                amount != null ? Money.cop(amount) : null, paymentStatus, paymentDate, gatewayReference);
    }

    public static Payment create(String transactionReference, Long reservationId, Long clientId,
                                  PaymentMethod paymentMethod, Money amount) {
        return new Payment(null, transactionReference, reservationId, clientId,
                paymentMethod, amount, PaymentStatus.COMPLETADO, Instant.now(), null);
    }

    public void markCompleted(String gatewayReference) {
        this.paymentStatus = PaymentStatus.COMPLETADO;
        this.gatewayReference = gatewayReference;
    }

    public void markFailed() {
        this.paymentStatus = PaymentStatus.FALLIDO;
    }

    public void refund() {
        this.paymentStatus = PaymentStatus.REEMBOLSADO;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }

    public Long getReservationId() {
        return reservationId;
    }

    public void setReservationId(Long reservationId) {
        this.reservationId = reservationId;
    }

    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public Money getAmount() {
        return amount;
    }

    public void setAmount(Money amount) {
        this.amount = amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount != null ? Money.cop(amount) : null;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public Instant getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(Instant paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getGatewayReference() {
        return gatewayReference;
    }

    public void setGatewayReference(String gatewayReference) {
        this.gatewayReference = gatewayReference;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Payment payment)) return false;
        return Objects.equals(id, payment.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Payment{" + "id=" + id + ", ref='" + transactionReference + '\'' + ", status=" + paymentStatus + '}';
    }
}
