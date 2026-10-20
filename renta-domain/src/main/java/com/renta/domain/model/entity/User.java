package com.renta.domain.model.entity;

import com.renta.domain.model.enums.UserRole;
import com.renta.domain.model.vo.Email;

import java.time.Instant;
import java.util.Objects;

/**
 * ============================================================================
 * ENTIDAD DE DOMINIO: USUARIO DEL SISTEMA (User)
 * ============================================================================
 * 
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Modela la cuenta de acceso de cualquier persona o entidad en la plataforma:
 * 1. Identificación y login: correo electrónico único validado con {@link Email}.
 * 2. Hash criptográfico de contraseña (cifrado con BCrypt costo 12).
 * 3. Asignación de rol {@link UserRole} (ROLE_ADMIN, ROLE_CLIENTE, ROLE_PROVEEDOR).
 * 4. Control de activación/bloqueo de cuenta (`active`).
 * 
 * ¿CÓMO SE RELACIONA CON CLIENTES Y PROVEEDORES?
 * Sigue el patrón de Especialización/Herencia de datos: la tabla `users` contiene
 * las credenciales y el rol común. Si el rol es `ROLE_CLIENTE`, se asocia a
 * la tabla `clients`; si es `ROLE_PROVEEDOR`, se asocia a la tabla `providers`.
 */
public class User {
    private Long id;
    private Email email;
    private String passwordHash;
    private Integer roleId;
    private UserRole role;
    private boolean active = true;
    private Instant createdAt;
    private Instant updatedAt;

    public User() {
    }

    public User(Long id, Email email, String passwordHash, Integer roleId, UserRole role, boolean active, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.roleId = roleId;
        this.role = role;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static User create(Email email, String passwordHash, Integer roleId, UserRole role) {
        Instant now = Instant.now();
        return new User(null, email, passwordHash, roleId, role, true, now, now);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Email getEmail() {
        return email;
    }

    public void setEmail(Email email) {
        this.email = email;
    }

    public void setEmail(String email) {
        this.email = email != null ? Email.of(email) : null;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Integer getRoleId() {
        return roleId;
    }

    public void setRoleId(Integer roleId) {
        this.roleId = roleId;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public void activate() {
        this.active = true;
        this.updatedAt = Instant.now();
    }

    public void deactivate() {
        this.active = false;
        this.updatedAt = Instant.now();
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User user)) return false;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "User{" + "id=" + id + ", email=" + email + ", role=" + role + ", active=" + active + '}';
    }
}
