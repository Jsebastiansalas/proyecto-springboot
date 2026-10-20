package com.renta.domain.model.entity;

import java.time.Instant;
import java.util.Objects;

/**
 * ============================================================================
 * ENTIDAD DE DOMINIO: EMPRESA PROVEEDORA DE MAQUINARIA (Provider)
 * ============================================================================
 * 
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Modela la empresa o contratista dueño del parque de maquinaria en alquiler:
 * 1. Vinculación 1 a 1 con la cuenta de acceso `userId` (ROLE_PROVEEDOR).
 * 2. Datos corporativos: razón social (`companyName`), representante legal y NIT/RUT.
 * 3. Ubicación física de sus bodegas y teléfono de contacto para despacho.
 * 4. Control de verificación institucional (`verified`), administrado por el rol ADMIN.
 */
public class Provider {
    private Long id;
    private Long userId;
    private String companyName;
    private String legalRepresentative;
    private String nitRut;
    private String phone;
    private String address;
    private String city;
    private boolean verified;
    private Instant createdAt;

    public Provider() {
    }

    public Provider(Long id, Long userId, String companyName, String legalRepresentative,
                    String nitRut, String phone, String address, String city, boolean verified, Instant createdAt) {
        this.id = id;
        this.userId = userId;
        this.companyName = companyName;
        this.legalRepresentative = legalRepresentative;
        this.nitRut = nitRut;
        this.phone = phone;
        this.address = address;
        this.city = city;
        this.verified = verified;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getLegalRepresentative() {
        return legalRepresentative;
    }

    public void setLegalRepresentative(String legalRepresentative) {
        this.legalRepresentative = legalRepresentative;
    }

    public String getNitRut() {
        return nitRut;
    }

    public void setNitRut(String nitRut) {
        this.nitRut = nitRut;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public void verify() {
        this.verified = true;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Provider provider)) return false;
        return Objects.equals(id, provider.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Provider{" + "id=" + id + ", company='" + companyName + '\'' + ", nit='" + nitRut + '\'' + '}';
    }
}
