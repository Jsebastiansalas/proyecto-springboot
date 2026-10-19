package com.renta.application.service;

import com.renta.application.dto.reservation.CreateReservationRequest;
import com.renta.application.dto.reservation.ReservationResponse;
import com.renta.domain.exception.ResourceNotFoundException;
import com.renta.domain.exception.ToolNotAvailableException;
import com.renta.domain.model.entity.Client;
import com.renta.domain.model.entity.Reservation;
import com.renta.domain.model.entity.Tool;
import com.renta.domain.model.entity.User;
import com.renta.domain.model.enums.ReservationStatus;
import com.renta.domain.model.enums.ToolStatus;
import com.renta.domain.model.vo.DateRange;
import com.renta.domain.model.vo.Email;
import com.renta.domain.model.vo.RentalPriceCalculation;
import com.renta.domain.port.out.ClientRepositoryPort;
import com.renta.domain.port.out.NotificationServicePort;
import com.renta.domain.port.out.ReservationRepositoryPort;
import com.renta.domain.port.out.ToolRepositoryPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

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

    @InjectMocks
    private ReservationApplicationService reservationService;

    private Tool sampleTool;
    private Client sampleClient;

    @BeforeEach
    void setUp() {
        sampleTool = new Tool();
        sampleTool.setId(10L);
        sampleTool.setName("Taladro Percutor Industrial");
        sampleTool.setStatus(ToolStatus.DISPONIBLE);
        sampleTool.setBaseDailyPrice(new BigDecimal("50000.00"));
        sampleTool.setDepositAmount(new BigDecimal("100000.00"));

        sampleClient = new Client();
        sampleClient.setId(1L);
        sampleClient.setUserId(20L);
        sampleClient.setFirstName("Juan");
        sampleClient.setLastName("Pérez");
    }

    @Test
    @DisplayName("Cálculo de precio: Aplica 15% de descuento semanal e IVA 19% para 7 días")
    void testCalculateRentalPrice_AppliesWeeklyDiscountFor7Days() {
        when(toolRepository.findById(10L)).thenReturn(Optional.of(sampleTool));

        LocalDate start = LocalDate.now().plusDays(10);
        DateRange range = DateRange.fromDays(start, 7);

        RentalPriceCalculation calc = reservationService.calculatePrice(10L, range);

        assertNotNull(calc);
        assertEquals(7, calc.totalDays());
        assertTrue(calc.weeklyDiscountApplied(), "Para alquileres de 7 o más días debe aplicarse el 15% de descuento semanal");
        
        // 50,000 * 7 = 350,000. Con 15% descuento = 297,500
        BigDecimal expectedSubtotal = new BigDecimal("297500.00");
        assertEquals(0, expectedSubtotal.compareTo(calc.subtotal().amount()));
        
        // IVA 19% de 297,500 = 56,525
        BigDecimal expectedTax = new BigDecimal("56525.00");
        assertEquals(0, expectedTax.compareTo(calc.taxAmount().amount()));

        // Total con IVA = 297,500 + 56,525 = 354,025
        BigDecimal expectedTotal = new BigDecimal("354025.00");
        assertEquals(0, expectedTotal.compareTo(calc.totalWithTax().amount()));
    }

    @Test
    @DisplayName("Crear reserva exitosa: Guarda en estado PENDIENTE y genera código único")
    void testCreateReservation_Success() {
        when(toolRepository.findById(10L)).thenReturn(Optional.of(sampleTool));
        when(clientRepository.findById(1L)).thenReturn(Optional.of(sampleClient));
        when(reservationRepository.existsOverlapping(eq(10L), any(DateRange.class))).thenReturn(false);
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> {
            Reservation r = invocation.getArgument(0);
            r.setId(99L);
            return r;
        });

        LocalDate start = LocalDate.now().plusDays(5);
        LocalDate end = start.plusDays(3);
        CreateReservationRequest req = new CreateReservationRequest(1L, 10L, start, end, "Obra Calle 100");

        ReservationResponse response = reservationService.createFromRequest(req);

        assertNotNull(response);
        assertEquals(99L, response.id());
        assertEquals(ReservationStatus.PENDIENTE, response.status());
        assertNotNull(response.reservationCode());

        verify(reservationRepository, times(1)).save(any(Reservation.class));
    }

    @Test
    @DisplayName("Crear reserva falla: Lanza ToolNotAvailableException si la herramienta está en MANTENIMIENTO")
    void testCreateReservation_ThrowsWhenToolNotAvailable() {
        sampleTool.setStatus(ToolStatus.MANTENIMIENTO);
        when(toolRepository.findById(10L)).thenReturn(Optional.of(sampleTool));

        LocalDate start = LocalDate.now().plusDays(5);
        LocalDate end = start.plusDays(3);
        CreateReservationRequest req = new CreateReservationRequest(1L, 10L, start, end, "Obra");

        assertThrows(ToolNotAvailableException.class, () -> reservationService.createFromRequest(req));
        verify(reservationRepository, never()).save(any(Reservation.class));
    }

    @Test
    @DisplayName("Crear reserva falla: Lanza ResourceNotFoundException si el cliente no existe")
    void testCreateReservation_ThrowsWhenClientNotFound() {
        when(toolRepository.findById(10L)).thenReturn(Optional.of(sampleTool));
        when(clientRepository.findById(999L)).thenReturn(Optional.empty());

        LocalDate start = LocalDate.now().plusDays(5);
        LocalDate end = start.plusDays(3);
        CreateReservationRequest req = new CreateReservationRequest(999L, 10L, start, end, "Obra");

        assertThrows(ResourceNotFoundException.class, () -> reservationService.createFromRequest(req));
        verify(reservationRepository, never()).save(any(Reservation.class));
    }

    @Test
    @DisplayName("Aprobar reserva: Cambia estado de PENDIENTE a APROBADA y notifica al cliente")
    void testApproveReservation_Success() {
        Reservation reservation = new Reservation();
        reservation.setId(50L);
        reservation.setStatus(ReservationStatus.PENDIENTE);
        reservation.setClientId(1L);
        reservation.setToolId(10L);

        when(reservationRepository.findById(50L)).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(i -> i.getArgument(0));

        Reservation approved = reservationService.approveReservation(50L);

        assertEquals(ReservationStatus.APROBADA, approved.getStatus());
        verify(reservationRepository, times(1)).save(reservation);
        verify(notificationService, times(1)).notifyReservationApproved(reservation);
    }
}
