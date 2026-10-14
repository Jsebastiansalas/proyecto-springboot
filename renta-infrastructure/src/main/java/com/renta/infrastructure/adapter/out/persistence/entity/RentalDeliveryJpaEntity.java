package com.renta.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "rental_deliveries")
public class RentalDeliveryJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reservation_id", nullable = false, unique = true)
    private Long reservationId;

    @Column(name = "delivery_date", nullable = false)
    private Instant deliveryDate = Instant.now();

    @Column(name = "delivered_by", nullable = false, length = 150)
    private String deliveredBy;

    @Column(name = "initial_condition_notes", nullable = false, columnDefinition = "TEXT")
    private String initialConditionNotes;

    @Column(name = "client_signature_ack", nullable = false)
    private boolean clientSignatureAck = true;

    public RentalDeliveryJpaEntity() {}

    public RentalDeliveryJpaEntity(Long id, Long reservationId, Instant deliveryDate, String deliveredBy,
                                  String initialConditionNotes, boolean clientSignatureAck) {
        this.id = id;
        this.reservationId = reservationId;
        this.deliveryDate = deliveryDate != null ? deliveryDate : Instant.now();
        this.deliveredBy = deliveredBy;
        this.initialConditionNotes = initialConditionNotes;
        this.clientSignatureAck = clientSignatureAck;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getReservationId() { return reservationId; }
    public void setReservationId(Long reservationId) { this.reservationId = reservationId; }
    public Instant getDeliveryDate() { return deliveryDate; }
    public void setDeliveryDate(Instant deliveryDate) { this.deliveryDate = deliveryDate; }
    public String getDeliveredBy() { return deliveredBy; }
    public void setDeliveredBy(String deliveredBy) { this.deliveredBy = deliveredBy; }
    public String getInitialConditionNotes() { return initialConditionNotes; }
    public void setInitialConditionNotes(String initialConditionNotes) { this.initialConditionNotes = initialConditionNotes; }
    public boolean isClientSignatureAck() { return clientSignatureAck; }
    public void setClientSignatureAck(boolean clientSignatureAck) { this.clientSignatureAck = clientSignatureAck; }
}
