package com.renta.domain.model.entity;

import java.time.Instant;
import java.util.Objects;

/**
 * Domain entity representing the initial handover and delivery certificate of rented equipment.
 */
public class RentalDelivery {
    private Long id;
    private Long reservationId;
    private Instant deliveryDate;
    private String deliveredBy;
    private String initialConditionNotes;
    private boolean clientSignatureAck = true;

    public RentalDelivery() {
    }

    public RentalDelivery(Long id, Long reservationId, Instant deliveryDate, String deliveredBy,
                          String initialConditionNotes, boolean clientSignatureAck) {
        this.id = id;
        this.reservationId = reservationId;
        this.deliveryDate = deliveryDate != null ? deliveryDate : Instant.now();
        this.deliveredBy = deliveredBy;
        this.initialConditionNotes = initialConditionNotes;
        this.clientSignatureAck = clientSignatureAck;
    }

    public static RentalDelivery create(Long reservationId, String deliveredBy, String initialConditionNotes, boolean signatureAck) {
        return new RentalDelivery(null, reservationId, Instant.now(), deliveredBy, initialConditionNotes, signatureAck);
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

    public Instant getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(Instant deliveryDate) {
        this.deliveryDate = deliveryDate;
    }

    public String getDeliveredBy() {
        return deliveredBy;
    }

    public void setDeliveredBy(String deliveredBy) {
        this.deliveredBy = deliveredBy;
    }

    public String getInitialConditionNotes() {
        return initialConditionNotes;
    }

    public void setInitialConditionNotes(String initialConditionNotes) {
        this.initialConditionNotes = initialConditionNotes;
    }

    public boolean isClientSignatureAck() {
        return clientSignatureAck;
    }

    public void setClientSignatureAck(boolean clientSignatureAck) {
        this.clientSignatureAck = clientSignatureAck;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RentalDelivery delivery)) return false;
        return Objects.equals(id, delivery.id) || Objects.equals(reservationId, delivery.reservationId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, reservationId);
    }

    @Override
    public String toString() {
        return "RentalDelivery{" + "id=" + id + ", reservationId=" + reservationId + ", deliveredBy='" + deliveredBy + '\'' + '}';
    }
}
