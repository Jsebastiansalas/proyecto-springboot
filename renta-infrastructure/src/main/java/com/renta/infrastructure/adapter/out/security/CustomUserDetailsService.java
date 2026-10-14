package com.renta.infrastructure.adapter.out.security;

import com.renta.infrastructure.adapter.out.persistence.entity.RoleJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.entity.UserJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataRoleRepository;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataUserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * ============================================================================
 * SERVICIO DE CARGA DE USUARIOS PARA SPRING SECURITY (UserDetailsService)
 * ============================================================================
 * 
 * ¿POR QUÉ EXISTE ESTA CLASE?
 * Spring Security no sabe cómo es tu base de datos ni cómo se llaman tus tablas.
 * Para poder autenticar a alguien, Spring Security te exige implementar esta interfaz:
 * `UserDetailsService` con su único método: `loadUserByUsername(String email)`.
 * 
 * ¿QUÉ HACE ESTE MÉTODO?
 * 1. Busca el usuario en la tabla `users` mediante su correo electrónico.
 * 2. Si no existe, lanza `UsernameNotFoundException`.
 * 3. Si existe, busca su rol en la tabla `roles` (ej. ROLE_CLIENTE, ROLE_ADMIN).
 * 4. Envuelve los datos en un objeto `CustomUserDetails` que Spring Security sí entiende.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final SpringDataUserRepository userRepository;
    private final SpringDataRoleRepository roleRepository;

    public CustomUserDetailsService(SpringDataUserRepository userRepository, SpringDataRoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // PASO 1: Buscar usuario por correo
        UserJpaEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con email: " + email));

        // PASO 2: Obtener el nombre del rol asignado (por defecto ROLE_CLIENTE si no se encuentra)
        String roleName = roleRepository.findById(user.getRoleId())
                .map(RoleJpaEntity::getName)
                .orElse("ROLE_CLIENTE");

        // PASO 3: Retornar el adaptador compatible con Spring Security
        return new CustomUserDetails(user, roleName);
    }
}
