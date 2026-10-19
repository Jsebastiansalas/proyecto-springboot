package com.renta.infrastructure.adapter.out.security;

import com.renta.domain.model.entity.Client;
import com.renta.domain.model.entity.Provider;
import com.renta.domain.model.entity.Reservation;
import com.renta.domain.model.entity.Tool;
import com.renta.domain.port.out.ClientRepositoryPort;
import com.renta.domain.port.out.InvoiceRepositoryPort;
import com.renta.domain.port.out.ProviderRepositoryPort;
import com.renta.domain.port.out.ReservationRepositoryPort;
import com.renta.domain.port.out.ToolRepositoryPort;
import com.renta.infrastructure.adapter.out.persistence.entity.UserJpaEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Pruebas unitarias para SecurityAuthorizationService (prevención BOLA/IDOR).
 */
class SecurityAuthorizationServiceTest {

    private ClientRepositoryPort clientRepository;
    private ProviderRepositoryPort providerRepository;
    private ReservationRepositoryPort reservationRepository;
    private ToolRepositoryPort toolRepository;
    private InvoiceRepositoryPort invoiceRepository;
    private SecurityAuthorizationService authz;

    @BeforeEach
    void setUp() {
        clientRepository = mock(ClientRepositoryPort.class);
        providerRepository = mock(ProviderRepositoryPort.class);
        reservationRepository = mock(ReservationRepositoryPort.class);
        toolRepository = mock(ToolRepositoryPort.class);
        invoiceRepository = mock(InvoiceRepositoryPort.class);
        authz = new SecurityAuthorizationService(
                clientRepository,
                providerRepository,
                reservationRepository,
                toolRepository,
                invoiceRepository
        );
    }

    private CustomUserDetails createUser(Long id, String email, String role) {
        UserJpaEntity entity = new UserJpaEntity();
        entity.setId(id);
        entity.setEmail(email);
        entity.setPasswordHash("hash");
        entity.setActive(true);
        return new CustomUserDetails(entity, role);
    }

    @Test
    @DisplayName("Admin siempre tiene acceso a cualquier recurso")
    void adminAlwaysHasAccess() {
        CustomUserDetails admin = createUser(99L, "admin@renta.com", "ROLE_ADMIN");
        assertTrue(authz.isClientOwner(admin, 1L));
        assertTrue(authz.isProviderOwner(admin, 1L));
        assertTrue(authz.canAccessReservation(admin, 10L));
        assertTrue(authz.canModifyTool(admin, 5L));
    }

    @Test
    @DisplayName("Cliente solo tiene acceso a su propio clientId")
    void clientOnlyAccessesOwnClientProfile() {
        CustomUserDetails clientUser = createUser(1L, "cliente1@correo.com", "ROLE_CLIENTE");

        Client client = new Client();
        client.setId(50L);
        client.setUserId(1L);

        when(clientRepository.findByUserId(1L)).thenReturn(Optional.of(client));

        assertTrue(authz.isClientOwner(clientUser, 50L));
        assertFalse(authz.isClientOwner(clientUser, 51L), "No debe acceder a otro clientId diferente");
    }

    @Test
    @DisplayName("Proveedor solo tiene acceso a su propio providerId")
    void providerOnlyAccessesOwnProviderProfile() {
        CustomUserDetails providerUser = createUser(21L, "proveedor1@correo.com", "ROLE_PROVEEDOR");

        Provider provider = new Provider();
        provider.setId(10L);
        provider.setUserId(21L);

        when(providerRepository.findByUserId(21L)).thenReturn(Optional.of(provider));

        assertTrue(authz.isProviderOwner(providerUser, 10L));
        assertFalse(authz.isProviderOwner(providerUser, 11L), "No debe acceder a otro providerId diferente");
    }

    @Test
    @DisplayName("Usuario no titular no puede acceder a reserva ajena")
    void unauthorizedUserCannotAccessForeignReservation() {
        CustomUserDetails user = createUser(2L, "cliente2@correo.com", "ROLE_CLIENTE");

        Client client2 = new Client();
        client2.setId(2L);
        client2.setUserId(2L);
        when(clientRepository.findByUserId(2L)).thenReturn(Optional.of(client2));

        Reservation res = new Reservation();
        res.setId(100L);
        res.setClientId(1L); // Pertenece a client 1
        res.setToolId(10L);

        when(reservationRepository.findById(100L)).thenReturn(Optional.of(res));
        when(toolRepository.findById(10L)).thenReturn(Optional.of(new Tool()));
        when(providerRepository.findByUserId(2L)).thenReturn(Optional.empty());

        assertFalse(authz.canAccessReservation(user, 100L));
    }
}
