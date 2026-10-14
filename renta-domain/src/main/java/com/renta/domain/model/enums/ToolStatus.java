package com.renta.domain.model.enums;

/**
 * Enumeration representing the operational and availability status of tools/equipment.
 */
public enum ToolStatus {
    DISPONIBLE,
    EN_USO,
    ALQUILADA,
    MANTENIMIENTO,
    RETIRADA,
    DADA_DE_BAJA;

    /**
     * Checks if the tool is ready and eligible for a new reservation.
     */
    public boolean isAvailable() {
        return this == DISPONIBLE;
    }

    /**
     * Checks if the tool is currently undergoing maintenance.
     */
    public boolean isInMaintenance() {
        return this == MANTENIMIENTO;
    }

    /**
     * Checks if the tool is currently in active rental.
     */
    public boolean isRented() {
        return this == EN_USO || this == ALQUILADA;
    }

    /**
     * Checks if the tool is retired or decommissioned from inventory.
     */
    public boolean isRetired() {
        return this == RETIRADA || this == DADA_DE_BAJA;
    }
}
