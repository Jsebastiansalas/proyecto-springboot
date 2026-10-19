package com.renta.boot;

import com.renta.application.dto.delivery.DamageReportRequest;
import com.renta.application.dto.delivery.DepositSettlementResponse;
import com.renta.application.dto.delivery.FinishRentalRequest;
import com.renta.application.dto.delivery.RentalDeliveryResponse;
import com.renta.application.dto.delivery.RentalReturnResponse;
import com.renta.application.dto.delivery.StartRentalRequest;
import com.renta.application.dto.invoice.InvoiceResponse;
import com.renta.application.dto.payment.PaymentResponse;
import com.renta.application.dto.payment.ProcessPaymentRequest;
import com.renta.application.dto.reservation.CreateReservationRequest;
import com.renta.application.dto.reservation.ReservationResponse;
import com.renta.application.dto.review.CreateReviewRequest;
import com.renta.application.dto.review.ReviewResponse;
import com.renta.application.dto.review.ToolRatingSummaryResponse;
import com.renta.application.service.DeliveryReturnApplicationService;
import com.renta.application.service.InvoiceApplicationService;
import com.renta.application.service.PaymentApplicationService;
import com.renta.application.service.ReservationApplicationService;
import com.renta.application.service.ReviewApplicationService;
import com.renta.domain.model.entity.Reservation;
import com.renta.domain.model.enums.PaymentMethod;
import com.renta.domain.model.enums.PaymentStatus;
import com.renta.domain.model.enums.ReservationStatus;
import com.renta.domain.model.enums.SettlementStatus;
import com.renta.domain.model.enums.ToolConditionStatus;
import com.renta.domain.model.vo.DateRange;
import com.renta.domain.model.vo.RentalPriceCalculation;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import com.renta.domain.port.out.ToolRepositoryPort;
import com.renta.domain.model.enums.ToolStatus;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class FullRentalLifecycleIntegrationTest {

    @Autowired
    private ReservationApplicationService reservationService;

    @Autowired
    private PaymentApplicationService paymentService;

    @Autowired
    private DeliveryReturnApplicationService deliveryReturnService;

    @Autowired
    private InvoiceApplicationService invoiceService;

    @Autowired
    private ReviewApplicationService reviewService;

    @Autowired
    private ToolRepositoryPort toolRepository;

    private static Long createdReservationId;

    @BeforeEach
    void ensureToolIsAvailable() {
        toolRepository.findById(1L).ifPresent(t -> {
            if (t.getStatus() != ToolStatus.DISPONIBLE) {
                t.setStatus(ToolStatus.DISPONIBLE);
                toolRepository.save(t);
            }
        });
    }

    @Test
    @Order(1)
    @DisplayName("Paso 1: Cálculo dinámico de tarifa con descuento semanal (15%) e IVA 19% para 7 días")
    void testCalculateRentalPriceWithWeeklyDiscount() {
        LocalDate start = LocalDate.now().plusDays(30);
        DateRange range = DateRange.fromDays(start, 7);

        RentalPriceCalculation calc = reservationService.calculatePrice(1L, range);

        assertNotNull(calc);
        assertEquals(7, calc.totalDays(), "Debe calcular exactamente 7 días de alquiler");
        assertTrue(calc.weeklyDiscountApplied(), "Para 7 días debe aplicar automáticamente el descuento semanal del 15%");
        assertNotNull(calc.subtotal());
        assertNotNull(calc.taxAmount());
        assertTrue(calc.taxAmount().amount().compareTo(BigDecimal.ZERO) > 0, "El impuesto IVA (19%) debe ser positivo");
    }

    @Test
    @Order(2)
    @DisplayName("Paso 2: Creación de solicitud de reserva en estado PENDIENTE")
    void testCreateReservation() {
        LocalDate start = LocalDate.now().plusDays(40);
        DateRange range = DateRange.fromDays(start, 7);

        CreateReservationRequest req = new CreateReservationRequest(
                1L, // Client 1
                1L, // Tool 1 (Rotomartillo)
                range.startDate(),
                range.endDate(),
                "Entrega en obra civil Calle 100 # 15-20"
        );

        ReservationResponse res = reservationService.createFromRequest(req);

        assertNotNull(res);
        assertNotNull(res.id());
        createdReservationId = res.id();
        assertTrue(res.reservationCode().startsWith("RES-"));
        assertEquals(ReservationStatus.PENDIENTE, res.status(), "La reserva recién creada debe iniciar en PENDIENTE");
        assertEquals(7, res.totalDays());
    }

    @Test
    @Order(3)
    @DisplayName("Paso 3: Aprobación de la reserva por el proveedor (Transición a APROBADA)")
    void testApproveReservation() {
        assertNotNull(createdReservationId, "Debe existir una reserva creada previamente");

        Reservation approved = reservationService.approveReservation(createdReservationId);

        assertEquals(ReservationStatus.APROBADA, approved.getStatus(), "La reserva debe transicionar a APROBADA");
    }

    @Test
    @Order(4)
    @DisplayName("Paso 4: Procesamiento de pago simulado y generación automática de factura fiscal")
    void testProcessPaymentAndInvoiceGeneration() {
        assertNotNull(createdReservationId);

        ReservationResponse res = reservationService.getReservationById(createdReservationId);
        BigDecimal totalAmount = res.totalAmount();

        ProcessPaymentRequest payReq = new ProcessPaymentRequest(
                createdReservationId,
                1L,
                PaymentMethod.TARJETA_CREDITO,
                totalAmount,
                "4532-****-****-9921",
                "REF-TEST-SIM-2026"
        );

        PaymentResponse paymentRes = paymentService.processFromRequest(payReq);
        assertNotNull(paymentRes);
        assertNotNull(paymentRes.id());
        assertEquals(PaymentStatus.COMPLETADO, paymentRes.paymentStatus());

        // Verificar que la factura asociada se haya emitido
        InvoiceResponse invoice = invoiceService.getInvoiceByReservationId(createdReservationId);
        assertNotNull(invoice);
        assertNotNull(invoice.invoiceNumber());
        assertTrue(invoice.invoiceNumber().startsWith("FAC-"));
        assertTrue(invoice.taxAmount().compareTo(BigDecimal.ZERO) > 0, "La factura debe liquidar el IVA (19%)");
        assertEquals(res.subtotal(), invoice.subtotal());
    }

    @Test
    @Order(5)
    @DisplayName("Paso 5: Despacho logístico inicial a pie de obra (Transición a EN_CURSO)")
    void testStartRentalDelivery() {
        assertNotNull(createdReservationId);

        StartRentalRequest startReq = new StartRentalRequest(
                createdReservationId,
                "Operador Logístico Central",
                "Equipo inspeccionado al 100%, lubricación y accesorios completos",
                true
        );

        RentalDeliveryResponse deliv = deliveryReturnService.startRentalFromRequest(startReq);
        assertNotNull(deliv);

        ReservationResponse res = reservationService.getReservationById(createdReservationId);
        assertEquals(ReservationStatus.EN_CURSO, res.status(), "El estado de la reserva debe ser EN_CURSO");
    }

    @Test
    @Order(6)
    @DisplayName("Paso 6: Acta de devolución, inspección técnica y reembolso de depósito (Transición a FINALIZADA)")
    void testFinishRentalReturn() {
        assertNotNull(createdReservationId);

        FinishRentalRequest finishReq = new FinishRentalRequest(
                createdReservationId,
                "Ingeniero Supervisor de Patio",
                ToolConditionStatus.EXCELENTE,
                "Equipo retornado en perfecto estado, horómetro dentro de tolerancia",
                true, // Reembolso de depósito
                BigDecimal.ZERO // Sin cargos por daño
        );

        RentalReturnResponse ret = deliveryReturnService.finishRentalFromRequest(finishReq);
        assertNotNull(ret);

        ReservationResponse res = reservationService.getReservationById(createdReservationId);
        assertEquals(ReservationStatus.FINALIZADA, res.status(), "El estado final de la reserva debe ser FINALIZADA");
    }

    @Test
    @Order(7)
    @DisplayName("Paso 7: Liquidación inteligente del depósito de garantía (Pilar 2)")
    void testDepositSettlementCalculation() {
        assertNotNull(createdReservationId);

        DepositSettlementResponse settlement = deliveryReturnService.getSettlementResponse(createdReservationId);
        assertNotNull(settlement);
        assertEquals(SettlementStatus.REEMBOLSO_TOTAL, settlement.settlementStatus(), "Sin averías debe reembolsar 100%");
        assertEquals(BigDecimal.ZERO.setScale(2), settlement.damageDeduction(), "Deducción por daños debe ser 0");
        assertTrue(settlement.refundAmount().compareTo(BigDecimal.ZERO) > 0, "El reembolso debe ser positivo");
        assertEquals(settlement.initialDeposit(), settlement.refundAmount());
    }

    @Test
    @Order(8)
    @DisplayName("Paso 8: Calificación y reseña del cliente tras finalización (Pilar 2)")
    void testClientReviewSubmission() {
        assertNotNull(createdReservationId);

        CreateReviewRequest reviewReq = new CreateReviewRequest(
                createdReservationId,
                5,
                "Excelente equipo, entrega puntual y máquina en perfecto estado.",
                1L
        );

        ReviewResponse reviewRes = reviewService.createReviewFromRequest(reviewReq);
        assertNotNull(reviewRes);
        assertEquals(5, reviewRes.rating());
        assertEquals(createdReservationId, reviewRes.reservationId());

        ToolRatingSummaryResponse toolSummary = reviewService.getToolRatingSummaryResponse(reviewRes.toolId());
        assertNotNull(toolSummary);
        assertTrue(toolSummary.totalReviews() > 0);
        assertTrue(toolSummary.averageRating() >= 4.0);
    }
}
