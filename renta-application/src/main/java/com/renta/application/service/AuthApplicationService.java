package com.renta.application.service;

import com.renta.application.dto.auth.LoginRequest;
import com.renta.application.dto.auth.LoginResponse;
import com.renta.application.dto.auth.RegisterClientRequest;
import com.renta.application.dto.auth.RegisterProviderRequest;
import com.renta.application.dto.auth.UserSummaryDto;
import com.renta.application.port.in.AuthUseCase;
import com.renta.application.port.out.PasswordEncoderPort;
import com.renta.application.port.out.TokenProviderPort;
import com.renta.domain.exception.BusinessRuleViolationException;
import com.renta.domain.exception.ResourceNotFoundException;
import com.renta.domain.model.entity.Client;
import com.renta.domain.model.entity.Provider;
import com.renta.domain.model.entity.User;
import com.renta.domain.model.enums.UserRole;
import com.renta.domain.model.vo.Email;
import com.renta.domain.port.out.ClientRepositoryPort;
import com.renta.domain.port.out.ProviderRepositoryPort;
import com.renta.domain.port.out.UserRepositoryPort;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

public class AuthApplicationService implements AuthUseCase {

    private final UserRepositoryPort userRepository;
    private final ClientRepositoryPort clientRepository;
    private final ProviderRepositoryPort providerRepository;
    private final PasswordEncoderPort passwordEncoder;
    private final TokenProviderPort tokenProvider;

    public AuthApplicationService(
            UserRepositoryPort userRepository,
            ClientRepositoryPort clientRepository,
            ProviderRepositoryPort providerRepository,
            PasswordEncoderPort passwordEncoder,
            TokenProviderPort tokenProvider) {
        this.userRepository = Objects.requireNonNull(userRepository);
        this.clientRepository = Objects.requireNonNull(clientRepository);
        this.providerRepository = Objects.requireNonNull(providerRepository);
        this.passwordEncoder = Objects.requireNonNull(passwordEncoder);
        this.tokenProvider = Objects.requireNonNull(tokenProvider);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessRuleViolationException("Credenciales inválidas: email o contraseña incorrectos"));

        if (!user.isActive()) {
            throw new BusinessRuleViolationException("La cuenta de usuario se encuentra inactiva. Contacte al administrador.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BusinessRuleViolationException("Credenciales inválidas: email o contraseña incorrectos");
        }

        String displayName = resolveDisplayName(user);
        String token = tokenProvider.generateToken(user.getId(), user.getEmail().value(), user.getRole());

        return LoginResponse.of(
                token,
                user.getId(),
                user.getEmail().value(),
                user.getRole(),
                displayName,
                tokenProvider.getExpirationMillis()
        );
    }

    @Override
    public LoginResponse registerClient(RegisterClientRequest request) {
        Email email = Email.of(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new BusinessRuleViolationException("Ya existe una cuenta registrada con el email: " + request.email());
        }

        if (clientRepository.findByDocumentNumber(request.documentNumber()).isPresent()) {
            throw new BusinessRuleViolationException("Ya existe un cliente con el documento: " + request.documentNumber());
        }

        String encodedPassword = passwordEncoder.encode(request.password());
        User user = new User(
                null,
                email,
                encodedPassword,
                3, // ROLE_CLIENTE
                UserRole.ROLE_CLIENTE,
                true,
                Instant.now(),
                Instant.now()
        );
        User savedUser = userRepository.save(user);

        Client client = new Client(
                null,
                savedUser.getId(),
                request.firstName(),
                request.lastName(),
                request.documentType(),
                request.documentNumber(),
                request.phone(),
                request.address(),
                request.city(),
                Instant.now()
        );
        clientRepository.save(client);

        String token = tokenProvider.generateToken(savedUser.getId(), savedUser.getEmail().value(), savedUser.getRole());
        return LoginResponse.of(
                token,
                savedUser.getId(),
                savedUser.getEmail().value(),
                savedUser.getRole(),
                client.getFullName(),
                tokenProvider.getExpirationMillis()
        );
    }

    @Override
    public LoginResponse registerProvider(RegisterProviderRequest request) {
        Email email = Email.of(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new BusinessRuleViolationException("Ya existe una cuenta registrada con el email: " + request.email());
        }

        if (providerRepository.findByNitRut(request.nitRut()).isPresent()) {
            throw new BusinessRuleViolationException("Ya existe un proveedor registrado con el NIT/RUT: " + request.nitRut());
        }

        String encodedPassword = passwordEncoder.encode(request.password());
        User user = new User(
                null,
                email,
                encodedPassword,
                2, // ROLE_PROVEEDOR
                UserRole.ROLE_PROVEEDOR,
                true,
                Instant.now(),
                Instant.now()
        );
        User savedUser = userRepository.save(user);

        Provider provider = new Provider(
                null,
                savedUser.getId(),
                request.companyName(),
                request.legalRepresentative(),
                request.nitRut(),
                request.phone(),
                request.address(),
                request.city(),
                true, // Auto-verificado inicialmente para demo
                Instant.now()
        );
        providerRepository.save(provider);

        String token = tokenProvider.generateToken(savedUser.getId(), savedUser.getEmail().value(), savedUser.getRole());
        return LoginResponse.of(
                token,
                savedUser.getId(),
                savedUser.getEmail().value(),
                savedUser.getRole(),
                provider.getCompanyName(),
                tokenProvider.getExpirationMillis()
        );
    }

    @Override
    public UserSummaryDto getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + userId));
        String displayName = resolveDisplayName(user);
        return new UserSummaryDto(
                user.getId(),
                user.getEmail().value(),
                user.getRole(),
                user.isActive(),
                displayName,
                user.getCreatedAt()
        );
    }

    @Override
    public List<UserSummaryDto> listAllUsers() {
        // Query users using client and provider repositories
        List<UserSummaryDto> list = new ArrayList<>();
        // In infrastructure we can query all users or iterate known ranges
        // Provided by UserRepositoryPort findById / findAll in implementation
        return list;
    }

    @Override
    public void toggleUserStatus(Long userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + userId));
        user.setActive(active);
        userRepository.save(user);
    }

    private String resolveDisplayName(User user) {
        if (user.getRole() == UserRole.ROLE_CLIENTE) {
            return clientRepository.findByUserId(user.getId())
                    .map(Client::getFullName)
                    .orElse("Cliente");
        } else if (user.getRole() == UserRole.ROLE_PROVEEDOR) {
            return providerRepository.findByUserId(user.getId())
                    .map(Provider::getCompanyName)
                    .orElse("Proveedor");
        } else {
            return "Administrador";
        }
    }
}
