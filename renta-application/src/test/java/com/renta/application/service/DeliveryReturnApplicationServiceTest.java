package com.renta.application.service;

import com.renta.application.dto.delivery.FinishRentalRequest;
import com.renta.application.dto.delivery.RentalDeliveryResponse;
import com.renta.application.dto.delivery.RentalReturnResponse;
import com.renta.application.dto.delivery.StartRentalRequest;
import com.renta.domain.model.entity.DamageReport;
import com.renta.domain.model.entity.RentalDelivery;
import com.renta.domain.model.entity.RentalReturn;
import com.renta.domain.model.entity.Reservation;
import com.renta.domain.model.entity.Tool;
import com.renta.domain.model.enums.DamageReportStatus;
import com.renta.domain.model.enums.DamageType;
import com.renta.domain.model.enums.ReservationStatus;
import com.renta.domain.model.enums.ToolConditionStatus;
import com.renta.domain.model.enums.ToolStatus;
import com.renta.domain.model.vo.Money;
import com.renta.domain.port.out.ClientRepositoryPort;
import com.renta.domain.port.out.DamageReportRepositoryPort;
import com.renta.domain.port.out.RentalDeliveryRepositoryPort;
import com.renta.domain.port.out.RentalReturnRepositoryPort;
import com.renta.domain.port.out.ReservationRepositoryPort;
import com.renta.domain.port.out.ToolRepositoryPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeliveryReturnApplicationServiceTest {

    @Mock
    private RentalDeliveryRepositoryPort deliveryRepository;

    @Mock
    private RentalReturnRepositoryPort returnRepository;

    @Mock
    private DamageReportRepositoryPort damageReportRepository;

    @Mock
    private ReservationRepositoryPort reservationRepository;

    @Mock
    private ToolRepositoryPort toolRepository;

    @Mock
    private ClientRepositoryPort clientRepository;

    @InjectMocks
    private DeliveryReturnApplicationService deliveryReturnService;

    private Reservation sampleReservation;
    private Tool sampleTool;

    @BeforeEach
    void setUp() {
        sampleTool = new Tool();
        sampleTool.setId(10L);
        sampleTool.setName("Generador Eléctrico 5kW");
        sampleTool.setStatus(ToolStatus.DISPONIBLE);
        sampleTool.setDepositAmount(new BigDecimal("200000.00"));

        sampleReservation = new Reservation();
        sampleReservation.setId(100L);
        sampleReservation.setReservationCode("RES-2026-TEST");
        sampleReservation.setStatus(ReservationStatus.APROBADA);
        sampleReservation.setToolId(10L);
        sampleReservation.setClientId(1L);
        sampleReservation.setDepositTotal(Money.cop(new BigDecimal("200000.00")));
    }

    @Test
    @DisplayName("Despacho exitoso: Transiciona reserva a EN_CURSO y persiste acta de entrega")
    void testStartRental_Success() {
        when(reservationRepository.findById(100L)).thenReturn(Optional.of(sampleReservation));
        when(deliveryRepository.findByReservationId(100L)).thenReturn(Optional.empty());
        when(deliveryRepository.save(any(RentalDelivery.class))).thenAnswer(i -> {
            RentalDelivery d = i.getArgument(0);
            d.setId(1L);
            d.setDeliveryDate(Instant.now());
            return d;
        });

        StartRentalRequest req = new StartRentalRequest(100L, "Operador Patio", "Máquina verificada", true);
        RentalDeliveryResponse res = deliveryReturnService.startRentalFromRequest(req);

        assertNotNull(res);
        assertEquals(ReservationStatus.EN_CURSO, sampleReservation.getStatus());

        verify(deliveryRepository, times(1)).save(any(RentalDelivery.class));
        verify(reservationRepository, times(1)).save(sampleReservation);
    }

    @Test
    @DisplayName("Devolución sin daños: Herramienta vuelve a DISPONIBLE, reembolso de depósito marcado")
    void testFinishRental_SuccessWithoutDamage() {
        sampleReservation.setStatus(ReservationStatus.EN_CURSO);
        sampleTool.setStatus(ToolStatus.ALQUILADA);

        when(reservationRepository.findById(100L)).thenReturn(Optional.of(sampleReservation));
        when(toolRepository.findById(10L)).thenReturn(Optional.of(sampleTool));
        when(returnRepository.save(any(RentalReturn.class))).thenAnswer(i -> {
            RentalReturn r = i.getArgument(0);
            r.setId(15L);
            r.setReturnDate(Instant.now());
            return r;
        });

        FinishRentalRequest req = new FinishRentalRequest(
                100L,
                "Jefe de Taller",
                ToolConditionStatus.EXCELENTE,
                "Equipo recibido impecable",
                true,
                BigDecimal.ZERO,
                BigDecimal.ZERO
        );

        RentalReturnResponse res = deliveryReturnService.finishRentalFromRequest(req);

        assertNotNull(res);
        assertEquals(ReservationStatus.FINALIZADA, sampleReservation.getStatus());
        assertEquals(ToolStatus.DISPONIBLE, sampleTool.getStatus());
        assertTrue(res.depositRefunded());
        assertEquals(0, BigDecimal.ZERO.compareTo(res.extraDamageFee()));

        // No debe crear reporte de daño
        verify(damageReportRepository, never()).save(any(DamageReport.class));
        verify(toolRepository, times(1)).save(sampleTool);
    }

    @Test
    @DisplayName("HU-04: Devolución con daño crea reporte en damage_reports y pasa herramienta a MANTENIMIENTO")
    void testFinishRental_WithDamage_PersistsDamageReportAndMarksToolMaintenance() {
        sampleReservation.setStatus(ReservationStatus.EN_CURSO);
        sampleTool.setStatus(ToolStatus.ALQUILADA);

        when(reservationRepository.findById(100L)).thenReturn(Optional.of(sampleReservation));
        when(toolRepository.findById(10L)).thenReturn(Optional.of(sampleTool));
        when(returnRepository.save(any(RentalReturn.class))).thenAnswer(i -> {
            RentalReturn r = i.getArgument(0);
            r.setId(22L);
            r.setReturnDate(Instant.now());
            return r;
        });

        FinishRentalRequest req = new FinishRentalRequest(
                100L,
                "Ingeniero de Mantenimiento",
                ToolConditionStatus.DANADO,
                "Falla eléctrica interna con humo en obra",
                false,
                new BigDecimal("120000.00"),
                new BigDecimal("120000.00"),
                DamageType.MOTOR,
                "Bobinado estatórico quemado por sobrecarga continua"
        );

        RentalReturnResponse res = deliveryReturnService.finishRentalFromRequest(req);

        assertNotNull(res);
        assertEquals(ReservationStatus.FINALIZADA, sampleReservation.getStatus());
        assertEquals(ToolStatus.MANTENIMIENTO, sampleTool.getStatus(), "La herramienta dañada debe pasar automáticamente a MANTENIMIENTO");

        // Verificar que se guardó el reporte de avería con los datos correctos
        ArgumentCaptor<DamageReport> captor = ArgumentCaptor.forClass(DamageReport.class);
        verify(damageReportRepository, times(1)).save(captor.capture());

        DamageReport savedReport = captor.getValue();
        assertEquals(22L, savedReport.getReturnId());
        assertEquals(DamageType.MOTOR, savedReport.getDamageType());
        assertEquals(DamageReportStatus.EVALUANDO, savedReport.getStatus());
        assertEquals(0, new BigDecimal("120000.00").compareTo(savedReport.getRepairCostEstimate().amount()));
        assertEquals("Bobinado estatórico quemado por sobrecarga continua", savedReport.getDescription());

        assertFalse(res.depositRefunded());
        assertEquals(0, BigDecimal.ZERO.compareTo(res.extraDamageFee()), "Como el depósito cubrió el costo, no hay cobro extra adeudado");
    }
}
