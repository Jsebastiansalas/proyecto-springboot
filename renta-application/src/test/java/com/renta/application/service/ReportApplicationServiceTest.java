package com.renta.application.service;

import com.renta.application.dto.report.AdminDashboardResponse;
import com.renta.application.dto.report.FrequentClientDto;
import com.renta.application.dto.report.RevenueMetricDto;
import com.renta.domain.model.entity.Client;
import com.renta.domain.model.entity.Provider;
import com.renta.domain.model.entity.Reservation;
import com.renta.domain.model.entity.Tool;
import com.renta.domain.model.entity.User;
import com.renta.domain.model.enums.ReservationStatus;
import com.renta.domain.model.enums.ToolStatus;
import com.renta.domain.model.vo.DateRange;
import com.renta.domain.model.vo.Email;
import com.renta.domain.model.vo.Money;
import com.renta.domain.port.out.ClientRepositoryPort;
import com.renta.domain.port.out.PaymentRepositoryPort;
import com.renta.domain.port.out.ProviderRepositoryPort;
import com.renta.domain.port.out.ReservationRepositoryPort;
import com.renta.domain.port.out.ToolRepositoryPort;
import com.renta.domain.port.out.UserRepositoryPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportApplicationServiceTest {

    @Mock
    private ToolRepositoryPort toolRepository;

    @Mock
    private ReservationRepositoryPort reservationRepository;

    @Mock
    private ProviderRepositoryPort providerRepository;

    @Mock
    private ClientRepositoryPort clientRepository;

    @Mock
    private UserRepositoryPort userRepository;

    @Mock
    private PaymentRepositoryPort paymentRepository;

    @InjectMocks
    private ReportApplicationService reportService;

    private Client client1;
    private Client client2;
    private User u1;
    private User u2;

    @BeforeEach
    void setUp() {
        u1 = new User();
        u1.setId(10L);
        u1.setEmail(new Email("carlos@empresa.com"));

        client1 = new Client();
        client1.setId(1L);
        client1.setUserId(10L);
        client1.setFirstName("Carlos");
        client1.setLastName("Gómez");
        client1.setDocumentNumber("10203040");

        u2 = new User();
        u2.setId(20L);
        u2.setEmail(new Email("maria@constructora.com"));

        client2 = new Client();
        client2.setId(2L);
        client2.setUserId(20L);
        client2.setFirstName("María");
        client2.setLastName("Rodríguez");
        client2.setDocumentNumber("900123456");
    }

    @Test
    @DisplayName("HU-05: Genera dashboard admin con totales reales, meses agrupados cronológicamente y Top Clientes")
    void testGenerateAdminDashboard_CalculatesRealTotalsAndTopClients() {
        when(userRepository.findAll()).thenReturn(List.of(u1, u2, new User()));
        when(clientRepository.findAll()).thenReturn(List.of(client1, client2));
        when(providerRepository.findAll()).thenReturn(List.of(new Provider()));

        when(clientRepository.findById(1L)).thenReturn(Optional.of(client1));
        when(clientRepository.findById(2L)).thenReturn(Optional.of(client2));
        when(userRepository.findById(10L)).thenReturn(Optional.of(u1));
        when(userRepository.findById(20L)).thenReturn(Optional.of(u2));

        Tool tool1 = new Tool();
        tool1.setId(100L);
        tool1.setName("Retroexcavadora");
        tool1.setStatus(ToolStatus.DISPONIBLE);

        Tool tool2 = new Tool();
        tool2.setId(101L);
        tool2.setName("Compactadora");
        tool2.setStatus(ToolStatus.ALQUILADA);

        when(toolRepository.findAll()).thenReturn(List.of(tool1, tool2));

        // Reserva 1: Cliente 1 en Marzo 2026, subtotal 500,000
        Reservation r1 = new Reservation();
        r1.setId(1L);
        r1.setClientId(1L);
        r1.setToolId(100L);
        r1.setStatus(ReservationStatus.FINALIZADA);
        r1.setDateRange(DateRange.of(LocalDate.of(2026, 3, 1), LocalDate.of(2026, 3, 5)));
        r1.setSubtotal(Money.cop(new BigDecimal("500000.00")));
        r1.setTotalAmount(Money.cop(new BigDecimal("500000.00")));
        r1.setDepositTotal(Money.cop(new BigDecimal("100000.00")));

        // Reserva 2: Cliente 1 en Abril 2026, subtotal 800,000
        Reservation r2 = new Reservation();
        r2.setId(2L);
        r2.setClientId(1L);
        r2.setToolId(100L);
        r2.setStatus(ReservationStatus.FINALIZADA);
        r2.setDateRange(DateRange.of(LocalDate.of(2026, 4, 10), LocalDate.of(2026, 4, 15)));
        r2.setSubtotal(Money.cop(new BigDecimal("800000.00")));
        r2.setTotalAmount(Money.cop(new BigDecimal("800000.00")));
        r2.setDepositTotal(Money.cop(new BigDecimal("100000.00")));

        // Reserva 3: Cliente 2 en Marzo 2026, subtotal 400,000
        Reservation r3 = new Reservation();
        r3.setId(3L);
        r3.setClientId(2L);
        r3.setToolId(101L);
        r3.setStatus(ReservationStatus.EN_CURSO);
        r3.setDateRange(DateRange.of(LocalDate.of(2026, 3, 20), LocalDate.of(2026, 3, 25)));
        r3.setSubtotal(Money.cop(new BigDecimal("400000.00")));
        r3.setTotalAmount(Money.cop(new BigDecimal("400000.00")));
        r3.setDepositTotal(Money.cop(new BigDecimal("50000.00")));

        when(reservationRepository.findAll()).thenReturn(List.of(r1, r2, r3));

        AdminDashboardResponse dash = reportService.getAdminDashboard();

        assertNotNull(dash);
        assertEquals(3, dash.totalUsers());
        assertEquals(2, dash.totalClients());
        assertEquals(1, dash.totalProviders());
        assertEquals(2, dash.totalTools());
        assertEquals(3, dash.totalReservations());
        assertEquals(1, dash.activeRentals());

        // Facturación total: 500k + 800k + 400k = 1,700,000
        assertEquals(0, new BigDecimal("1700000.00").compareTo(dash.totalRevenue()));

        // Mensual dinámico: 2 meses ("2026-03" y "2026-04")
        List<RevenueMetricDto> monthly = dash.monthlyRevenue();
        assertEquals(2, monthly.size());
        assertEquals("2026-03", monthly.get(0).period());
        assertEquals(2, monthly.get(0).transactionCount()); // r1 + r3
        assertEquals(0, new BigDecimal("900000.00").compareTo(monthly.get(0).amount()));

        assertEquals("2026-04", monthly.get(1).period());
        assertEquals(1, monthly.get(1).transactionCount()); // r2
        assertEquals(0, new BigDecimal("800000.00").compareTo(monthly.get(1).amount()));

        // Top Clientes Frecuentes: Carlos Gómez (#1 con 2 reservas y 1,300,000 COP)
        List<FrequentClientDto> topClients = dash.topFrequentClients();
        assertFalse(topClients.isEmpty());
        FrequentClientDto top1 = topClients.get(0);
        assertEquals(1L, top1.clientId());
        assertEquals("Carlos Gómez", top1.clientName());
        assertEquals("carlos@empresa.com", top1.email());
        assertEquals(2, top1.totalReservations());
        assertEquals(0, new BigDecimal("1300000.00").compareTo(top1.totalSpent()));
    }
}
