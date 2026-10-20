package com.renta.domain.model.entity;

import com.renta.domain.model.enums.PaymentMethod;
import com.renta.domain.model.enums.PaymentStatus;
import com.renta.domain.model.vo.Money;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * ============================================================================
 * ENTIDAD DE DOMINIO: TRANSACCIÓN FINANCIERA DE PAGO (Payment)
 * ============================================================================
 * 
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Representa la transacción económica realizada por el cliente:
 * 1. Genera y almacena la referencia bancaria única (`TXN-timestamp-hash`).
 * 2. Registra el método de pago (TARJETA_CREDITO, PSE, TRANSFERENCIA).
 * 3. Valida el importe monetario mediante {@link Money}.
 * 4. Controla el estado de la transacción:
 *    - `PENDIENTE`: Iniciada en el checkout.
 *    - `APROBADA`: Confirmada por la pasarela de pagos.
 *    - `RECHAZADA`: Denegada por fondos insuficientes o fallo bancario.
 * 5. Soporta pago en cuotas financieras y cálculo de intereses si aplica.
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
    private Integer installmentCount = 1;
    private Integer paidInstallments = 1;
    private BigDecimal monthlyInterestRate = BigDecimal.ZERO;

    public Payment() {
    }

    public Payment(Long id, String transactionReference, Long reservationId, Long clientId,
                   PaymentMethod paymentMethod, Money amount, PaymentStatus paymentStatus,
                   Instant paymentDate, String gatewayReference) {
        this(id, transactionReference, reservationId, clientId, paymentMethod, amount, paymentStatus,
                paymentDate, gatewayReference, 1, 1, BigDecimal.ZERO);
    }

    public Payment(Long id, String transactionReference, Long reservationId, Long clientId,
                   PaymentMethod paymentMethod, Money amount, PaymentStatus paymentStatus,
                   Instant paymentDate, String gatewayReference,
                   Integer installmentCount, Integer paidInstallments, BigDecimal monthlyInterestRate) {
        this.id = id;
        this.transactionReference = transactionReference;
        this.reservationId = reservationId;
        this.clientId = clientId;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
        this.paymentStatus = paymentStatus != null ? paymentStatus : PaymentStatus.PENDIENTE;
        this.paymentDate = paymentDate != null ? paymentDate : Instant.now();
        this.gatewayReference = gatewayReference;
        this.installmentCount = installmentCount != null ? installmentCount : 1;
        this.paidInstallments = paidInstallments != null ? paidInstallments : 1;
        this.monthlyInterestRate = monthlyInterestRate != null ? monthlyInterestRate : BigDecimal.ZERO;
    }

    public Payment(Long id, String transactionReference, Long reservationId, Long clientId,
                   PaymentMethod paymentMethod, BigDecimal amount, PaymentStatus paymentStatus,
                   Instant paymentDate, String gatewayReference) {
        this(id, transactionReference, reservationId, clientId, paymentMethod,
                amount != null ? Money.cop(amount) : null, paymentStatus, paymentDate, gatewayReference, 1, 1, BigDecimal.ZERO);
    }

    public Payment(Long id, String transactionReference, Long reservationId, Long clientId,
                   PaymentMethod paymentMethod, BigDecimal amount, PaymentStatus paymentStatus,
                   Instant paymentDate, String gatewayReference,
                   Integer installmentCount, Integer paidInstallments, BigDecimal monthlyInterestRate) {
        this(id, transactionReference, reservationId, clientId, paymentMethod,
                amount != null ? Money.cop(amount) : null, paymentStatus, paymentDate, gatewayReference,
                installmentCount, paidInstallments, monthlyInterestRate);
    }

    public static Payment create(String transactionReference, Long reservationId, Long clientId,
                                  PaymentMethod paymentMethod, Money amount) {
        return new Payment(null, transactionReference, reservationId, clientId,
                paymentMethod, amount, PaymentStatus.COMPLETADO, Instant.now(), null, 1, 1, BigDecimal.ZERO);
    }

    public void markCompleted(String gatewayReference) {
        this.paymentStatus = PaymentStatus.COMPLETADO;
        this.gatewayReference = gatewayReference;
        this.paidInstallments = this.installmentCount;
    }

    public void payInstallment() {
        if (this.paidInstallments == null) this.paidInstallments = 0;
        this.paidInstallments++;
        if (this.installmentCount != null && this.paidInstallments >= this.installmentCount) {
            this.paymentStatus = PaymentStatus.COMPLETADO;
        } else {
            this.paymentStatus = PaymentStatus.EN_CUOTAS;
        }
    }

    public boolean isFullyPaid() {
        return this.paymentStatus == PaymentStatus.COMPLETADO ||
                (this.installmentCount != null && this.paidInstallments != null && this.paidInstallments >= this.installmentCount);
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

    public Integer getInstallmentCount() {
        return installmentCount;
    }

    public void setInstallmentCount(Integer installmentCount) {
        this.installmentCount = installmentCount;
    }

    public Integer getPaidInstallments() {
        return paidInstallments;
    }

    public void setPaidInstallments(Integer paidInstallments) {
        this.paidInstallments = paidInstallments;
    }

    public BigDecimal getMonthlyInterestRate() {
        return monthlyInterestRate;
    }

    public void setMonthlyInterestRate(BigDecimal monthlyInterestRate) {
        this.monthlyInterestRate = monthlyInterestRate;
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
