package com.renta.infrastructure.adapter.out.security;

import com.renta.infrastructure.adapter.out.persistence.entity.UserJpaEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * ============================================================================
 * ADAPTADOR DE USUARIO PARA SPRING SECURITY (UserDetails)
 * ============================================================================
 * 
 * ¿QUÉ ES USERDETAILS?
 * Es el modelo estándar interno que usa Spring Security para representar
 * a un usuario autenticado durante la sesión o petición HTTP.
 * 
 * Esta clase envuelve nuestra entidad de base de datos (`UserJpaEntity`) y le
 * responde a Spring Security preguntas como:
 * - ¿Cuál es su contraseña encriptada? -> getPassword()
 * - ¿Cuál es su identificador de inicio de sesión? -> getUsername() (en nuestro caso, el email)
 * - ¿Qué permisos o roles tiene? -> getAuthorities() (ROLE_ADMIN, ROLE_CLIENTE, etc.)
 * - ¿La cuenta está activa o bloqueada? -> isAccountNonLocked()
 */
public class CustomUserDetails implements UserDetails {

    private final Long id;
    private final String email;
    private final String password;
    private final boolean active;
    private final String roleName;

    public CustomUserDetails(UserJpaEntity user, String roleName) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.password = user.getPasswordHash();
        this.active = user.isActive();
        this.roleName = roleName;
    }

    public Long getId() {
        return id;
    }

    public String getRoleName() {
        return roleName;
    }

    /**
     * Retorna la lista de roles del usuario con el formato de Spring Security.
     * Ejemplo: ROLE_CLIENTE o ROLE_ADMIN
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(roleName));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // La cuenta nunca expira por tiempo
    }

    @Override
    public boolean isAccountNonLocked() {
        return active; // Si active == false, Spring Security bloqueará el acceso automáticamente
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // La contraseña no caduca
    }

    @Override
    public boolean isEnabled() {
        return active; // Cuenta habilitada
    }
}
