package com.renta.application.service;

import com.renta.application.dto.reservation.CreateReservationRequest;
import com.renta.application.dto.reservation.ReservationResponse;
import com.renta.domain.exception.ReservationConflictException;
import com.renta.domain.exception.ToolNotAvailableException;
import com.renta.domain.model.entity.Client;
import com.renta.domain.model.entity.Reservation;
import com.renta.domain.model.entity.Tool;
import com.renta.domain.model.enums.DocumentType;
import com.renta.domain.model.enums.ReservationStatus;
import com.renta.domain.model.enums.ToolStatus;
import com.renta.domain.model.vo.DateRange;
import com.renta.domain.model.vo.Money;
import com.renta.domain.port.out.ClientRepositoryPort;
import com.renta.domain.port.out.NotificationServicePort;
import com.renta.domain.port.out.PaymentRepositoryPort;
import com.renta.domain.port.out.ReservationRepositoryPort;
import com.renta.domain.port.out.ToolRepositoryPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * ============================================================================
 * PRUEBAS CON MOCKS DE APLICACIÓN: ReservationApplicationServiceTest
 * ============================================================================
 * Valida la orquestación de casos de uso aislando las dependencias de base de
 * datos con Mockito y JUnit 5 estándar.
 */
@ExtendWith(MockitoExtension.class)
class ReservationApplicationServiceTest {

    @Mock
    private ReservationRepositoryPort reservationRepository;

    @Mock
    private ToolRepositoryPort toolRepository;

    @Mock
    private ClientRepositoryPort clientRepository;

    @Mock
    private NotificationServicePort notificationService;

    @Mock
    private PaymentRepositoryPort paymentRepository;

    @InjectMocks
    private ReservationApplicationService reservationService;

    private Tool mockTool;
    private Client mockClient;

    @BeforeEach
    void setUp() {
        mockTool = new Tool();
        mockTool.setId(10L);
        mockTool.setName("Martillo Demoledor 30kg");
        mockTool.setCodeSku("HERR-DEM-01");
        mockTool.setBaseDailyPrice(Money.of(120000));
        mockTool.setDepositAmount(Money.of(300000));
        mockTool.setStatus(ToolStatus.DISPONIBLE);

        mockClient = new Client(1L, 100L, "Juan", "Pérez", DocumentType.CC, "1020304050",
                "3001234567", "Calle 100 # 15-20", "Bogotá", Instant.now());
    }

    @Test
    @DisplayName("Debe crear una reserva exitosamente cuando la herramienta está disponible")
    void shouldCreateReservationSuccessfully() {
        LocalDate start = LocalDate.now().plusDays(2);
        LocalDate end = start.plusDays(4);
        CreateReservationRequest request = new CreateReservationRequest(
                1L, 10L, start, end, "Alquiler para remodelación"
        );

        when(toolRepository.findById(10L)).thenReturn(Optional.of(mockTool));
        when(clientRepository.findById(1L)).thenReturn(Optional.of(mockClient));
        when(reservationRepository.existsOverlapping(eq(10L), any(DateRange.class)))
                .thenReturn(false);

        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> {
            Reservation r = invocation.getArgument(0);
            r.setId(99L);
            return r;
        });

        ReservationResponse response = reservationService.createFromRequest(request);

        assertNotNull(response);
        assertEquals(99L, response.id());
        assertEquals(ReservationStatus.PENDIENTE, response.status());
        verify(reservationRepository).save(any(Reservation.class));
    }

    @Test
    @DisplayName("Debe lanzar ToolNotAvailableException si la herramienta está en MANTENIMIENTO")
    void shouldThrowExceptionWhenToolIsInMaintenance() {
        mockTool.setStatus(ToolStatus.MANTENIMIENTO);

        LocalDate start = LocalDate.now().plusDays(1);
        LocalDate end = start.plusDays(3);
        CreateReservationRequest request = new CreateReservationRequest(1L, 10L, start, end, "Prueba");

        when(toolRepository.findById(10L)).thenReturn(Optional.of(mockTool));

        assertThrows(ToolNotAvailableException.class, () -> reservationService.createFromRequest(request));
    }

    @Test
    @DisplayName("Debe lanzar ReservationConflictException si ya existe otra reserva en las mismas fechas")
    void shouldThrowExceptionWhenDatesOverlap() {
        LocalDate start = LocalDate.now().plusDays(5);
        LocalDate end = start.plusDays(10);
        CreateReservationRequest request = new CreateReservationRequest(1L, 10L, start, end, "Solapamiento");

        when(toolRepository.findById(10L)).thenReturn(Optional.of(mockTool));
        when(clientRepository.findById(1L)).thenReturn(Optional.of(mockClient));
        when(reservationRepository.existsOverlapping(eq(10L), any(DateRange.class)))
                .thenReturn(true);

        ReservationConflictException ex = assertThrows(ReservationConflictException.class,
                () -> reservationService.createFromRequest(request));
        assertTrue(ex.getMessage().contains("solapa"));
    }
}
