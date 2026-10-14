package com.renta.domain.model.entity;

import com.renta.domain.exception.BusinessRuleViolationException;
import com.renta.domain.exception.ToolNotAvailableException;
import com.renta.domain.model.enums.ReservationStatus;
import com.renta.domain.model.enums.ToolStatus;
import com.renta.domain.model.vo.DateRange;
import com.renta.domain.model.vo.Money;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Pruebas Unitarias - Agregado Reservation y Máquina de Estados")
class ReservationTest {

    private Tool availableTool;
    private Tool maintenanceTool;
    private DateRange standardDateRange;

    @BeforeEach
    void setUp() {
        standardDateRange = new DateRange(LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 5));

        availableTool = Tool.create(
                10L,
                1,
                "HERR-0001",
                "Taladro Percutor Industrial",
                "DeWalt",
                "DWD024",
                "Taladro 650W",
                Money.cop(45_000),
                Money.cop(150_000)
        );
        availableTool.setId(101L);

        maintenanceTool = Tool.create(
                10L,
                1,
                "HERR-0002",
                "Rotomartillo SDS Max",
                "Bosch",
                "GBH 8-45 D",
                "Rotomartillo 1500W",
                Money.cop(80_000),
                Money.cop(250_000)
        );
        maintenanceTool.setId(102L);
        maintenanceTool.markInMaintenance();
    }

    @Test
    @DisplayName("R39: Secuencia de ciclo de vida válida: PENDIENTE -> APROBADA -> EN_CURSO -> FINALIZADA")
    void shouldAllowValidTransitionChain() {
        Reservation reservation = Reservation.create(
                "RES-2026-0001",
                50L,
                availableTool,
                standardDateRange,
                Money.cop(225_000),
                Money.cop(150_000),
                "Entrega en obra"
        );

        assertEquals(ReservationStatus.PENDIENTE, reservation.getStatus());

        // PENDIENTE -> APROBADA
        reservation.approve();
        assertEquals(ReservationStatus.APROBADA, reservation.getStatus());

        // APROBADA -> EN_CURSO
        reservation.startRental();
        assertEquals(ReservationStatus.EN_CURSO, reservation.getStatus());

        // EN_CURSO -> FINALIZADA
        reservation.finishRental();
        assertEquals(ReservationStatus.FINALIZADA, reservation.getStatus());
        assertTrue(reservation.getStatus().isTerminal());
    }

    @Test
    @DisplayName("R39: Transición inválida PENDIENTE -> FINALIZADA debe lanzar BusinessRuleViolationException")
    void shouldThrowBusinessRuleViolationOnPendienteToFinalizada() {
        Reservation reservation = Reservation.create(
                "RES-2026-0002",
                50L,
                availableTool,
                standardDateRange,
                Money.cop(225_000),
                Money.cop(150_000),
                "Test"
        );

        assertEquals(ReservationStatus.PENDIENTE, reservation.getStatus());

        BusinessRuleViolationException exception = assertThrows(
                BusinessRuleViolationException.class,
                reservation::finishRental
        );
        assertTrue(exception.getMessage().contains("Transición de estado inválida"));

        // Intentar también con transitionTo directo
        assertThrows(
                BusinessRuleViolationException.class,
                () -> reservation.transitionTo(ReservationStatus.FINALIZADA)
        );
    }

    @Test
    @DisplayName("R39: Transición inválida PENDIENTE -> EN_CURSO debe lanzar BusinessRuleViolationException")
    void shouldThrowBusinessRuleViolationOnPendienteToEnCurso() {
        Reservation reservation = Reservation.create(
                "RES-2026-0003",
                50L,
                availableTool,
                standardDateRange,
                Money.cop(225_000),
                Money.cop(150_000),
                "Test"
        );

        assertThrows(
                BusinessRuleViolationException.class,
                reservation::startRental
        );
    }

    @Test
    @DisplayName("R39: No se puede cancelar una reserva que ya se encuentra EN_CURSO")
    void shouldThrowBusinessRuleViolationOnEnCursoToCancelada() {
        Reservation reservation = Reservation.create(
                "RES-2026-0004",
                50L,
                availableTool,
                standardDateRange,
                Money.cop(225_000),
                Money.cop(150_000),
                "Test"
        );
        reservation.approve();
        reservation.startRental();

        assertThrows(
                BusinessRuleViolationException.class,
                () -> reservation.cancel("Cliente solicita cancelar")
        );
    }

    @Test
    @DisplayName("R39: Estados terminales (FINALIZADA, CANCELADA, RECHAZADA) no permiten transiciones adicionales")
    void shouldThrowBusinessRuleViolationOnTerminalStates() {
        Reservation resFinalizada = Reservation.create("R-1", 1L, availableTool, standardDateRange, Money.cop(100), Money.zero(), null);
        resFinalizada.approve();
        resFinalizada.startRental();
        resFinalizada.finishRental();

        assertThrows(BusinessRuleViolationException.class, resFinalizada::approve);
        assertThrows(BusinessRuleViolationException.class, () -> resFinalizada.cancel("test"));

        Reservation resCancelada = Reservation.create("R-2", 1L, availableTool, standardDateRange, Money.cop(100), Money.zero(), null);
        resCancelada.cancel("Cancelación inicial");

        assertThrows(BusinessRuleViolationException.class, resCancelada::approve);
        assertThrows(BusinessRuleViolationException.class, resCancelada::startRental);

        Reservation resRechazada = Reservation.create("R-3", 1L, availableTool, standardDateRange, Money.cop(100), Money.zero(), null);
        resRechazada.reject("Falta de inventario");

        assertThrows(BusinessRuleViolationException.class, resRechazada::approve);
        assertThrows(BusinessRuleViolationException.class, () -> resRechazada.transitionTo(ReservationStatus.EN_CURSO));
    }

    @Test
    @DisplayName("R40: Crear una reserva sobre una herramienta en MANTENIMIENTO lanza ToolNotAvailableException")
    void shouldThrowToolNotAvailableExceptionWhenToolInMantenimiento() {
        assertEquals(ToolStatus.MANTENIMIENTO, maintenanceTool.getStatus());
        assertTrue(maintenanceTool.isInMaintenance());

        ToolNotAvailableException exception = assertThrows(
                ToolNotAvailableException.class,
                () -> Reservation.create(
                        "RES-2026-0005",
                        50L,
                        maintenanceTool,
                        standardDateRange,
                        Money.cop(400_000),
                        Money.cop(250_000),
                        "Intento de reserva en taller"
                )
        );

        assertTrue(exception.getMessage().contains("MANTENIMIENTO"));
    }

    @Test
    @DisplayName("R40: Crear reserva sobre herramienta RETIRADA lanza ToolNotAvailableException")
    void shouldThrowToolNotAvailableExceptionWhenToolIsRetired() {
        Tool retiredTool = Tool.create(10L, 1, "HERR-0003", "Equipo", "Marca", "M1", "Desc", Money.cop(50_000), Money.zero());
        retiredTool.setId(103L);
        retiredTool.markRetired();

        assertThrows(
                ToolNotAvailableException.class,
                () -> Reservation.create("RES-2026-0006", 50L, retiredTool, standardDateRange, Money.cop(250_000), Money.zero(), null)
        );
    }

    @Test
    @DisplayName("R40: Crear reserva sobre herramienta DISPONIBLE inicializa montos e invariantes correctamente")
    void shouldCreateReservationSuccessfullyWhenToolIsDisponible() {
        Reservation reservation = Reservation.create(
                "RES-2026-0007",
                50L,
                availableTool,
                standardDateRange,
                Money.cop(225_000),
                Money.cop(150_000),
                "Reserva exitosa"
        );

        assertNotNull(reservation);
        assertEquals(5, reservation.getTotalDays());
        assertEquals(new BigDecimal("225000.00"), reservation.getSubtotal().amount());
        assertEquals(new BigDecimal("150000.00"), reservation.getDepositTotal().amount());
        assertEquals(new BigDecimal("375000.00"), reservation.getTotalAmount().amount());
        assertEquals(ReservationStatus.PENDIENTE, reservation.getStatus());
    }
}
