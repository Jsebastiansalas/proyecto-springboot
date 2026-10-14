package com.renta.domain.model.enums;

/**
 * Lifecycle status of security deposit settlement following equipment return.
 */
public enum SettlementStatus {
    /** Full deposit refunded to client when equipment is returned without damage. */
    REEMBOLSO_TOTAL,
    /** Partial deposit refunded after deducting estimated repair costs. */
    REEMBOLSO_PARCIAL,
    /** Total deposit retained to cover repair costs that match deposit amount. */
    RETENIDO_TOTAL,
    /** Repair costs exceeded deposit; additional balance charged to client. */
    SALDO_PENDIENTE_COBRO
}
