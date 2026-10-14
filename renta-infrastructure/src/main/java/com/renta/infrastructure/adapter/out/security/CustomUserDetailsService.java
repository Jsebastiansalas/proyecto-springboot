package com.renta.infrastructure.adapter.out.security;

import com.renta.infrastructure.adapter.out.persistence.entity.RoleJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.entity.UserJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataRoleRepository;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataUserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

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
        UserJpaEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con email: " + email));

        String roleName = roleRepository.findById(user.getRoleId())
                .map(RoleJpaEntity::getName)
                .orElse("ROLE_CLIENTE");

        return new CustomUserDetails(user, roleName);
    }
}
