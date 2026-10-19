package com.renta.infrastructure.adapter.out.security;

import com.renta.domain.port.out.ClientRepositoryPort;
import com.renta.domain.port.out.InvoiceRepositoryPort;
import com.renta.domain.port.out.ProviderRepositoryPort;
import com.renta.domain.port.out.ReservationRepositoryPort;
import com.renta.domain.port.out.ToolRepositoryPort;
import org.springframework.stereotype.Service;

/**
 * ============================================================================
 * SERVICIO DE AUTORIZACIÓN Y CONTROL DE ACCESO (OWASP BOLA / IDOR PREVENTION)
 * ============================================================================
 * 
 * Expuesto como bean de Spring con nombre "@authz" para utilizarse en
 * expresiones SpEL dentro de anotaciones @PreAuthorize en Controllers:
 * Ej: @PreAuthorize("@authz.canAccessReservation(principal, #id)")
 * 
 * Evita que usuarios autenticados manipulen IDs para ver o modificar
 * recursos que pertenecen a otros usuarios o empresas.
 */
@Service("authz")
public class SecurityAuthorizationService {

    private final ClientRepositoryPort clientRepository;
    private final ProviderRepositoryPort providerRepository;
    private final ReservationRepositoryPort reservationRepository;
    private final ToolRepositoryPort toolRepository;
    private final InvoiceRepositoryPort invoiceRepository;

    public SecurityAuthorizationService(ClientRepositoryPort clientRepository,
                                        ProviderRepositoryPort providerRepository,
                                        ReservationRepositoryPort reservationRepository,
                                        ToolRepositoryPort toolRepository,
                                        InvoiceRepositoryPort invoiceRepository) {
        this.clientRepository = clientRepository;
        this.providerRepository = providerRepository;
        this.reservationRepository = reservationRepository;
        this.toolRepository = toolRepository;
        this.invoiceRepository = invoiceRepository;
    }

    /**
     * Valida si el usuario autenticado es el dueño del perfil de cliente especificado (o ADMIN).
     */
    public boolean isClientOwner(CustomUserDetails principal, Long clientId) {
        if (principal == null || clientId == null) return false;
        if (isAdmin(principal)) return true;
        return clientRepository.findByUserId(principal.getId())
                .map(client -> client.getId().equals(clientId))
                .orElse(false);
    }

    /**
     * Valida si el usuario autenticado es el dueño de la empresa proveedora especificada (o ADMIN).
     */
    public boolean isProviderOwner(CustomUserDetails principal, Long providerId) {
        if (principal == null || providerId == null) return false;
        if (isAdmin(principal)) return true;
        return providerRepository.findByUserId(principal.getId())
                .map(provider -> provider.getId().equals(providerId))
                .orElse(false);
    }

    /**
     * Valida si el usuario tiene permiso para consultar o gestionar una reserva:
     * - Administradores (acceso global).
     * - El cliente que creó la reserva.
     * - El proveedor dueño de la maquinaria reservada.
     */
    public boolean canAccessReservation(CustomUserDetails principal, Long reservationId) {
        if (principal == null || reservationId == null) return false;
        if (isAdmin(principal)) return true;

        return reservationRepository.findById(reservationId).map(res -> {
            // ¿Es el cliente titular de la reserva?
            boolean isClient = clientRepository.findByUserId(principal.getId())
                    .map(c -> c.getId().equals(res.getClientId()))
                    .orElse(false);
            if (isClient) return true;

            // ¿Es el proveedor propietario del equipo alquilado?
            return toolRepository.findById(res.getToolId())
                    .flatMap(tool -> providerRepository.findByUserId(principal.getId())
                            .map(p -> p.getId().equals(tool.getProviderId())))
                    .orElse(false);
        }).orElse(false);
    }

    /**
     * Valida si el usuario puede modificar o cambiar el estado de una herramienta (solo el proveedor dueño o ADMIN).
     */
    public boolean canModifyTool(CustomUserDetails principal, Long toolId) {
        if (principal == null || toolId == null) return false;
        if (isAdmin(principal)) return true;

        return toolRepository.findById(toolId).flatMap(tool ->
                providerRepository.findByUserId(principal.getId())
                        .map(p -> p.getId().equals(tool.getProviderId()))
        ).orElse(false);
    }

    /**
     * Valida si el usuario puede consultar o descargar una factura fiscal.
     */
    public boolean canAccessInvoice(CustomUserDetails principal, Long invoiceId) {
        if (principal == null || invoiceId == null) return false;
        if (isAdmin(principal)) return true;

        return invoiceRepository.findById(invoiceId)
                .map(inv -> canAccessReservation(principal, inv.getReservationId()))
                .orElse(false);
    }

    /**
     * Verifica si el usuario cuenta con el rol ROLE_ADMIN.
     */
    public boolean isAdmin(CustomUserDetails principal) {
        if (principal == null) return false;
        return principal.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }
}
