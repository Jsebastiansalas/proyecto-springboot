package com.renta.domain.model.entity;

import com.renta.domain.exception.BusinessRuleViolationException;
import com.renta.domain.exception.ToolNotAvailableException;
import com.renta.domain.model.enums.ReservationStatus;
import com.renta.domain.model.enums.ToolStatus;
import com.renta.domain.model.vo.DateRange;
import com.renta.domain.model.vo.Money;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Adversarial Suite - Reservation Lifecycle State Machine & Guardrails")
class ReservationLifecycleAdversarialTest {

    private Tool availableTool;
    private DateRange standardDateRange;

    @BeforeEach
    void setUp() {
        standardDateRange = new DateRange(LocalDate.of(2026, 7, 1), LocalDate.of(2026, 7, 5));
        availableTool = Tool.create(
                10L,
                1,
                "SKU-ADV-001",
                "Sierra Circular de Banco",
                "Bosch",
                "GTS 10 J",
                "Sierra de mesa profesional",
                Money.cop(55_000),
                Money.cop(200_000)
        );
        availableTool.setId(201L);
    }

    private Reservation createPendingReservation(String code) {
        return Reservation.create(
                code,
                99L,
                availableTool,
                standardDateRange,
                Money.cop(275_000),
                Money.cop(200_000),
                "Test de ciclo de vida adversarial"
        );
    }

    @Nested
    @DisplayName("1. Legal Transition Sequences")
    class LegalTransitions {

        @Test
        @DisplayName("Legal sequence: PENDIENTE -> APROBADA -> EN_CURSO -> FINALIZADA via explicit domain methods")
        void testLegalLifecycleChainExplicitMethods() {
            Reservation res = createPendingReservation("RES-LEGAL-01");
            assertEquals(ReservationStatus.PENDIENTE, res.getStatus());
            assertFalse(res.getStatus().isTerminal());

            // PENDIENTE -> APROBADA
            res.approve();
            assertEquals(ReservationStatus.APROBADA, res.getStatus());
            assertFalse(res.getStatus().isTerminal());

            // APROBADA -> EN_CURSO
            res.startRental();
            assertEquals(ReservationStatus.EN_CURSO, res.getStatus());
            assertFalse(res.getStatus().isTerminal());

            // EN_CURSO -> FINALIZADA
            res.finishRental();
            assertEquals(ReservationStatus.FINALIZADA, res.getStatus());
            assertTrue(res.getStatus().isTerminal());
        }

        @Test
        @DisplayName("Legal sequence: PENDIENTE -> APROBADA -> EN_CURSO -> FINALIZADA via generic transitionTo")
        void testLegalLifecycleChainViaTransitionTo() {
            Reservation res = createPendingReservation("RES-LEGAL-02");
            assertEquals(ReservationStatus.PENDIENTE, res.getStatus());

            res.transitionTo(ReservationStatus.APROBADA);
            assertEquals(ReservationStatus.APROBADA, res.getStatus());

            res.transitionTo(ReservationStatus.EN_CURSO);
            assertEquals(ReservationStatus.EN_CURSO, res.getStatus());

            res.transitionTo(ReservationStatus.FINALIZADA);
            assertEquals(ReservationStatus.FINALIZADA, res.getStatus());
            assertTrue(res.getStatus().isTerminal());
        }

        @Test
        @DisplayName("Legal cancellation: PENDIENTE -> CANCELADA (explicit method and transitionTo)")
        void testLegalCancellationFromPendiente() {
            // Explicit cancel
            Reservation res1 = createPendingReservation("RES-CANCEL-01");
            res1.cancel("Cliente cancela antes de aprobación");
            assertEquals(ReservationStatus.CANCELADA, res1.getStatus());
            assertTrue(res1.getStatus().isTerminal());
            assertTrue(res1.getNotes().contains("Cancelación: Cliente cancela antes de aprobación"));

            // Via transitionTo
            Reservation res2 = createPendingReservation("RES-CANCEL-02");
            res2.transitionTo(ReservationStatus.CANCELADA);
            assertEquals(ReservationStatus.CANCELADA, res2.getStatus());
            assertTrue(res2.getStatus().isTerminal());
        }

        @Test
        @DisplayName("Legal cancellation: APROBADA -> CANCELADA (explicit method and transitionTo)")
        void testLegalCancellationFromAprobada() {
            // Explicit cancel
            Reservation res1 = createPendingReservation("RES-CANCEL-03");
            res1.approve();
            assertEquals(ReservationStatus.APROBADA, res1.getStatus());
            res1.cancel("Obra suspendida por lluvia");
            assertEquals(ReservationStatus.CANCELADA, res1.getStatus());
            assertTrue(res1.getStatus().isTerminal());
            assertTrue(res1.getNotes().contains("Cancelación: Obra suspendida por lluvia"));

            // Via transitionTo
            Reservation res2 = createPendingReservation("RES-CANCEL-04");
            res2.approve();
            res2.transitionTo(ReservationStatus.CANCELADA);
            assertEquals(ReservationStatus.CANCELADA, res2.getStatus());
            assertTrue(res2.getStatus().isTerminal());
        }

        @Test
        @DisplayName("Legal rejection: PENDIENTE -> RECHAZADA (explicit method and transitionTo)")
        void testLegalRejectionFromPendiente() {
            // Explicit reject
            Reservation res1 = createPendingReservation("RES-REJECT-01");
            res1.reject("Documentos del cliente incompletos");
            assertEquals(ReservationStatus.RECHAZADA, res1.getStatus());
            assertTrue(res1.getStatus().isTerminal());
            assertTrue(res1.getNotes().contains("Rechazo: Documentos del cliente incompletos"));

            // Via transitionTo
            Reservation res2 = createPendingReservation("RES-REJECT-02");
            res2.transitionTo(ReservationStatus.RECHAZADA);
            assertEquals(ReservationStatus.RECHAZADA, res2.getStatus());
            assertTrue(res2.getStatus().isTerminal());
        }
    }

    @Nested
    @DisplayName("2. Illegal State Machine Transitions")
    class IllegalTransitions {

        @Test
        @DisplayName("Illegal transition: PENDIENTE -> FINALIZADA MUST throw BusinessRuleViolationException")
        void testIllegalPendienteToFinalizada() {
            Reservation res = createPendingReservation("RES-ILLEGAL-01");

            assertThrows(BusinessRuleViolationException.class, res::finishRental);
            assertThrows(BusinessRuleViolationException.class, res::finalizeRental);
            assertThrows(BusinessRuleViolationException.class, () -> res.transitionTo(ReservationStatus.FINALIZADA));
            assertEquals(ReservationStatus.PENDIENTE, res.getStatus());
        }

        @Test
        @DisplayName("Illegal transition: PENDIENTE -> EN_CURSO MUST throw BusinessRuleViolationException")
        void testIllegalPendienteToEnCurso() {
            Reservation res = createPendingReservation("RES-ILLEGAL-02");

            assertThrows(BusinessRuleViolationException.class, res::startRental);
            assertThrows(BusinessRuleViolationException.class, () -> res.transitionTo(ReservationStatus.EN_CURSO));
            assertEquals(ReservationStatus.PENDIENTE, res.getStatus());
        }

        @Test
        @DisplayName("Illegal transition: APROBADA -> FINALIZADA / RECHAZADA MUST throw BusinessRuleViolationException")
        void testIllegalTransitionsFromAprobada() {
            Reservation res = createPendingReservation("RES-ILLEGAL-03");
            res.approve();

            assertThrows(BusinessRuleViolationException.class, res::finishRental);
            assertThrows(BusinessRuleViolationException.class, () -> res.transitionTo(ReservationStatus.FINALIZADA));
            assertThrows(BusinessRuleViolationException.class, () -> res.reject("Intento de rechazar aprobada"));
            assertThrows(BusinessRuleViolationException.class, () -> res.transitionTo(ReservationStatus.RECHAZADA));
            assertThrows(BusinessRuleViolationException.class, res::approve);
            assertThrows(BusinessRuleViolationException.class, () -> res.transitionTo(ReservationStatus.PENDIENTE));
            assertEquals(ReservationStatus.APROBADA, res.getStatus());
        }

        @Test
        @DisplayName("Illegal transition: EN_CURSO -> CANCELADA / RECHAZADA / APROBADA MUST throw BusinessRuleViolationException")
        void testIllegalTransitionsFromEnCurso() {
            Reservation res = createPendingReservation("RES-ILLEGAL-04");
            res.approve();
            res.startRental();
            assertEquals(ReservationStatus.EN_CURSO, res.getStatus());

            assertThrows(BusinessRuleViolationException.class, () -> res.cancel("No se puede cancelar"));
            assertThrows(BusinessRuleViolationException.class, () -> res.transitionTo(ReservationStatus.CANCELADA));
            assertThrows(BusinessRuleViolationException.class, () -> res.reject("No se puede rechazar"));
            assertThrows(BusinessRuleViolationException.class, () -> res.transitionTo(ReservationStatus.RECHAZADA));
            assertThrows(BusinessRuleViolationException.class, res::approve);
            assertThrows(BusinessRuleViolationException.class, () -> res.transitionTo(ReservationStatus.APROBADA));
            assertThrows(BusinessRuleViolationException.class, res::startRental);
            assertThrows(BusinessRuleViolationException.class, () -> res.transitionTo(ReservationStatus.PENDIENTE));
            assertEquals(ReservationStatus.EN_CURSO, res.getStatus());
        }

        @Test
        @DisplayName("Terminal state: FINALIZADA -> any status MUST throw BusinessRuleViolationException")
        void testTerminalStateFinalizadaRejectsTransitions() {
            Reservation res = createPendingReservation("RES-FINAL-01");
            res.approve();
            res.startRental();
            res.finishRental();
            assertEquals(ReservationStatus.FINALIZADA, res.getStatus());
            assertTrue(res.getStatus().isTerminal());

            // Direct domain methods
            assertThrows(BusinessRuleViolationException.class, res::approve, "approve() must fail on FINALIZADA");
            assertThrows(BusinessRuleViolationException.class, res::startRental, "startRental() must fail on FINALIZADA");
            assertThrows(BusinessRuleViolationException.class, res::finishRental, "finishRental() must fail on FINALIZADA");
            assertThrows(BusinessRuleViolationException.class, () -> res.cancel("Cancel intento"), "cancel() must fail on FINALIZADA");
            assertThrows(BusinessRuleViolationException.class, () -> res.reject("Reject intento"), "reject() must fail on FINALIZADA");

            // Transition to non-final statuses
            assertThrows(BusinessRuleViolationException.class, () -> res.transitionTo(ReservationStatus.PENDIENTE));
            assertThrows(BusinessRuleViolationException.class, () -> res.transitionTo(ReservationStatus.APROBADA));
            assertThrows(BusinessRuleViolationException.class, () -> res.transitionTo(ReservationStatus.EN_CURSO));
            assertThrows(BusinessRuleViolationException.class, () -> res.transitionTo(ReservationStatus.CANCELADA));
            assertThrows(BusinessRuleViolationException.class, () -> res.transitionTo(ReservationStatus.RECHAZADA));
        }

        @ParameterizedTest(name = "FINALIZADA -> {0} MUST throw BusinessRuleViolationException")
        @EnumSource(ReservationStatus.class)
        @DisplayName("Terminal state: FINALIZADA -> any status MUST throw BusinessRuleViolationException")
        void testFinalizadaToAnyStatusMustThrow(ReservationStatus target) {
            Reservation res = createPendingReservation("RES-FINAL-STRICT-" + target);
            res.approve();
            res.startRental();
            res.finishRental();
            assertEquals(ReservationStatus.FINALIZADA, res.getStatus());

            assertThrows(
                    BusinessRuleViolationException.class,
                    () -> res.transitionTo(target),
                    "transitionTo(" + target + ") from FINALIZADA must throw BusinessRuleViolationException"
            );
        }

        @Test
        @DisplayName("Terminal state: CANCELADA -> any status MUST throw BusinessRuleViolationException")
        void testTerminalStateCanceladaRejectsTransitions() {
            Reservation res = createPendingReservation("RES-CANC-01");
            res.cancel("Cancelación inicial");
            assertEquals(ReservationStatus.CANCELADA, res.getStatus());
            assertTrue(res.getStatus().isTerminal());

            // Direct domain methods
            assertThrows(BusinessRuleViolationException.class, res::approve, "approve() must fail on CANCELADA");
            assertThrows(BusinessRuleViolationException.class, res::startRental, "startRental() must fail on CANCELADA");
            assertThrows(BusinessRuleViolationException.class, res::finishRental, "finishRental() must fail on CANCELADA");
            assertThrows(BusinessRuleViolationException.class, () -> res.cancel("Re-cancel intento"), "cancel() must fail on CANCELADA");
            assertThrows(BusinessRuleViolationException.class, () -> res.reject("Reject intento"), "reject() must fail on CANCELADA");

            // Transition to other statuses
            assertThrows(BusinessRuleViolationException.class, () -> res.transitionTo(ReservationStatus.PENDIENTE));
            assertThrows(BusinessRuleViolationException.class, () -> res.transitionTo(ReservationStatus.APROBADA));
            assertThrows(BusinessRuleViolationException.class, () -> res.transitionTo(ReservationStatus.EN_CURSO));
            assertThrows(BusinessRuleViolationException.class, () -> res.transitionTo(ReservationStatus.FINALIZADA));
            assertThrows(BusinessRuleViolationException.class, () -> res.transitionTo(ReservationStatus.RECHAZADA));

            // Status enum invariants
            assertFalse(ReservationStatus.CANCELADA.canTransitionTo(ReservationStatus.PENDIENTE));
            assertFalse(ReservationStatus.CANCELADA.canTransitionTo(ReservationStatus.APROBADA));
            assertFalse(ReservationStatus.CANCELADA.canTransitionTo(ReservationStatus.EN_CURSO));
            assertFalse(ReservationStatus.CANCELADA.canTransitionTo(ReservationStatus.FINALIZADA));
            assertFalse(ReservationStatus.CANCELADA.canTransitionTo(ReservationStatus.RECHAZADA));
            assertFalse(ReservationStatus.CANCELADA.canTransitionTo(ReservationStatus.CANCELADA));
        }

        @Test
        @DisplayName("Terminal state: RECHAZADA -> any status MUST throw BusinessRuleViolationException")
        void testTerminalStateRechazadaRejectsTransitions() {
            Reservation res = createPendingReservation("RES-RECH-01");
            res.reject("Rechazo inicial");
            assertEquals(ReservationStatus.RECHAZADA, res.getStatus());
            assertTrue(res.getStatus().isTerminal());

            // Direct domain methods
            assertThrows(BusinessRuleViolationException.class, res::approve, "approve() must fail on RECHAZADA");
            assertThrows(BusinessRuleViolationException.class, res::startRental, "startRental() must fail on RECHAZADA");
            assertThrows(BusinessRuleViolationException.class, res::finishRental, "finishRental() must fail on RECHAZADA");
            assertThrows(BusinessRuleViolationException.class, () -> res.cancel("Cancel intento"), "cancel() must fail on RECHAZADA");
            assertThrows(BusinessRuleViolationException.class, () -> res.reject("Re-reject intento"), "reject() must fail on RECHAZADA");

            // Transition to other statuses
            assertThrows(BusinessRuleViolationException.class, () -> res.transitionTo(ReservationStatus.PENDIENTE));
            assertThrows(BusinessRuleViolationException.class, () -> res.transitionTo(ReservationStatus.APROBADA));
            assertThrows(BusinessRuleViolationException.class, () -> res.transitionTo(ReservationStatus.EN_CURSO));
            assertThrows(BusinessRuleViolationException.class, () -> res.transitionTo(ReservationStatus.FINALIZADA));
            assertThrows(BusinessRuleViolationException.class, () -> res.transitionTo(ReservationStatus.CANCELADA));

            // Status enum invariants
            assertFalse(ReservationStatus.RECHAZADA.canTransitionTo(ReservationStatus.PENDIENTE));
            assertFalse(ReservationStatus.RECHAZADA.canTransitionTo(ReservationStatus.APROBADA));
            assertFalse(ReservationStatus.RECHAZADA.canTransitionTo(ReservationStatus.EN_CURSO));
            assertFalse(ReservationStatus.RECHAZADA.canTransitionTo(ReservationStatus.FINALIZADA));
            assertFalse(ReservationStatus.RECHAZADA.canTransitionTo(ReservationStatus.CANCELADA));
            assertFalse(ReservationStatus.RECHAZADA.canTransitionTo(ReservationStatus.RECHAZADA));
        }
    }

    @Nested
    @DisplayName("3. Tool Availability Guardrail")
    class ToolAvailabilityGuardrail {

        @Test
        @DisplayName("Reservation creation with tool in MANTENIMIENTO MUST throw ToolNotAvailableException")
        void testCreatingReservationWithToolInMantenimientoThrows() {
            Tool tool = Tool.create(1L, 1, "SKU-MANT", "Generador", "Honda", "EU22i", "Generador 2.2kW", Money.cop(90_000), Money.cop(300_000));
            tool.setId(301L);
            tool.markInMaintenance();
            assertEquals(ToolStatus.MANTENIMIENTO, tool.getStatus());
            assertTrue(tool.isInMaintenance());
            assertFalse(tool.isAvailable());

            ToolNotAvailableException ex = assertThrows(
                    ToolNotAvailableException.class,
                    () -> Reservation.create("RES-TOOL-01", 10L, tool, standardDateRange, Money.cop(450_000), Money.zero(), null)
            );
            assertTrue(ex.getMessage().contains("301"));
            assertTrue(ex.getMessage().contains("MANTENIMIENTO"));
        }

        @ParameterizedTest(name = "ToolStatus non-available: {0}")
        @EnumSource(value = ToolStatus.class, names = {"MANTENIMIENTO", "RETIRADA", "DADA_DE_BAJA", "EN_USO", "ALQUILADA"})
        @DisplayName("Reservation creation with ANY non-DISPONIBLE tool MUST throw ToolNotAvailableException")
        void testCreatingReservationWithAnyNonAvailableToolStatusThrows(ToolStatus nonAvailableStatus) {
            Tool tool = Tool.create(1L, 1, "SKU-UNAVAIL-" + nonAvailableStatus, "Demo", "Marca", "Mod", "Desc", Money.cop(50_000), Money.zero());
            tool.setId(400L + nonAvailableStatus.ordinal());
            tool.setStatus(nonAvailableStatus);
            assertFalse(tool.isAvailable());

            ToolNotAvailableException ex = assertThrows(
                    ToolNotAvailableException.class,
                    () -> Reservation.create("RES-UNAVAIL-" + nonAvailableStatus, 10L, tool, standardDateRange, Money.cop(250_000), Money.zero(), null)
            );
            assertTrue(ex.getMessage().contains(String.valueOf(tool.getId())));
        }

        @Test
        @DisplayName("Reservation creation with tool in DISPONIBLE succeeds and establishes initial state")
        void testCreatingReservationWithToolInDisponibleSucceeds() {
            Tool tool = Tool.create(1L, 1, "SKU-AVAIL", "Demo", "Marca", "Mod", "Desc", Money.cop(45_000), Money.cop(150_000));
            tool.setId(500L);
            assertEquals(ToolStatus.DISPONIBLE, tool.getStatus());
            assertTrue(tool.isAvailable());

            Reservation res = Reservation.create("RES-AVAIL-OK", 10L, tool, standardDateRange, Money.cop(225_000), Money.cop(150_000), "OK");
            assertNotNull(res);
            assertEquals(ReservationStatus.PENDIENTE, res.getStatus());
            assertEquals(tool.getId(), res.getToolId());
            assertEquals(new BigDecimal("225000.00"), res.getSubtotal().amount());
            assertEquals(new BigDecimal("150000.00"), res.getDepositTotal().amount());
            assertEquals(new BigDecimal("375000.00"), res.getTotalAmount().amount());
        }
    }
}
