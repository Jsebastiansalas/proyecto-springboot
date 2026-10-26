package com.renta.infrastructure.adapter.in.rest;

import com.renta.application.dto.client.ClientTrustScoreResponse;
import com.renta.domain.exception.ResourceNotFoundException;
import com.renta.infrastructure.adapter.out.persistence.entity.ClientJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.entity.RentalReturnJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.entity.ReservationJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataClientRepository;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataRentalReturnRepository;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataReservationRepository;
import com.renta.infrastructure.adapter.out.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/clients")
@Tag(name = "11. Calificación y Score de Confiabilidad", description = "Algoritmo de scoring crediticio y operativo para contratistas de obra")
public class ClientTrustScoreController {

    private final SpringDataClientRepository clientRepository;
    private final SpringDataReservationRepository reservationRepository;
    private final SpringDataRentalReturnRepository returnRepository;

    public ClientTrustScoreController(
            SpringDataClientRepository clientRepository,
            SpringDataReservationRepository reservationRepository,
            SpringDataRentalReturnRepository returnRepository) {
        this.clientRepository = clientRepository;
        this.reservationRepository = reservationRepository;
        this.returnRepository = returnRepository;
    }

    @GetMapping("/{clientId:[0-9]+}/trust-score")
    @Operation(summary = "Calcular score de confiabilidad de un contratista", description = "Evalúa la tasa de puntualidad, incidentes de daño en obra y volumen histórico de contratos para calcular el trust score (0-100).")
    public ResponseEntity<ClientTrustScoreResponse> getClientTrustScore(@PathVariable Long clientId) {
        ClientJpaEntity client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con ID: " + clientId));

        return ResponseEntity.ok(computeScore(client));
    }

    @GetMapping("/my/trust-score")
    @PreAuthorize("hasAnyRole('CLIENTE', 'ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Score de confiabilidad del cliente autenticado", description = "Permite al contratista consultar su score de confiabilidad, tier de descuento de fianza y beneficios activos.")
    public ResponseEntity<ClientTrustScoreResponse> getMyTrustScore(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        ClientJpaEntity client = clientRepository.findByUserId(userDetails.getId())
                .orElseGet(() -> clientRepository.findById(1L).orElse(null));

        if (client == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(computeScore(client));
    }

    private ClientTrustScoreResponse computeScore(ClientJpaEntity client) {
        List<ReservationJpaEntity> reservations = reservationRepository.findByClientId(client.getId());
        int totalContracts = reservations.size();
        int completedContracts = 0;
        int activeContracts = 0;
        int cancelledContracts = 0;
        int lateReturns = 0;
        int damageIncidents = 0;

        for (ReservationJpaEntity res : reservations) {
            String status = res.getStatus();
            if ("FINALIZADA".equalsIgnoreCase(status)) {
                completedContracts++;
                Optional<RentalReturnJpaEntity> retOpt = returnRepository.findByReservationId(res.getId());
                if (retOpt.isPresent()) {
                    RentalReturnJpaEntity ret = retOpt.get();
                    if ("DANADO".equalsIgnoreCase(ret.getToolConditionStatus()) ||
                            (ret.getExtraDamageFee() != null && ret.getExtraDamageFee().compareTo(BigDecimal.ZERO) > 0)) {
                        damageIncidents++;
                    }
                    if (ret.getReturnDate() != null && res.getEndDate() != null) {
                        java.time.LocalDate returnDay = ret.getReturnDate().atZone(ZoneId.systemDefault()).toLocalDate();
                        if (returnDay.isAfter(res.getEndDate())) {
                            lateReturns++;
                        }
                    }
                }
            } else if ("EN_CURSO".equalsIgnoreCase(status) || "APROBADA".equalsIgnoreCase(status)) {
                activeContracts++;
            } else if ("CANCELADA".equalsIgnoreCase(status)) {
                cancelledContracts++;
            }
        }

        int score;
        if (totalContracts == 0) {
            score = 85; // Calificación base para contratistas nuevos
        } else {
            score = 100 - (damageIncidents * 15) - (lateReturns * 10) - (cancelledContracts * 5) + (completedContracts * 2);
            if (score > 100) score = 100;
            if (score < 0) score = 0;
        }

        String tier;
        String badgeColor;
        int depositDiscount;
        String benefits;
        String recommendation;

        if (score >= 90) {
            tier = "EXCELENTE";
            badgeColor = "emerald";
            depositDiscount = 50;
            benefits = "Exención del 50% en fianza de garantía, despacho express y línea de crédito preferencial.";
            recommendation = "Contratista Platinum. Aprobación inmediata sin validaciones adicionales.";
        } else if (score >= 75) {
            tier = "CONFIABLE";
            badgeColor = "blue";
            depositDiscount = 20;
            benefits = "20% de descuento en fianza de garantía y condiciones de entrega estándar.";
            recommendation = "Contratista Calificado. Historial con excelente cumplimiento en obra.";
        } else if (score >= 50) {
            tier = "RIESGO_MODERADO";
            badgeColor = "amber";
            depositDiscount = 0;
            benefits = "Depósito del 100% de fianza en custodia. Requerida validación telefónica.";
            recommendation = "Verificar póliza de seguro y experiencia del operador antes del despacho.";
        } else {
            tier = "ALTO_RIESGO";
            badgeColor = "red";
            depositDiscount = 0;
            benefits = "Fianza del 150% obligatoria y retención en patio hasta confirmación de pago.";
            recommendation = "Riesgo alto de siniestralidad. Requiere aprobación expresa de gerencia técnica.";
        }

        double punctualityRate = completedContracts > 0
                ? Math.round(((completedContracts - lateReturns) * 100.0 / completedContracts) * 10.0) / 10.0
                : 100.0;
        if (punctualityRate < 0) punctualityRate = 0;

        String clientFullName = (client.getFirstName() != null ? client.getFirstName() : "") + " " +
                (client.getLastName() != null ? client.getLastName() : "").trim();
        String companyName = clientFullName + " Construcciones";

        return new ClientTrustScoreResponse(
                client.getId(),
                clientFullName.trim().isEmpty() ? "Contratista Registrado" : clientFullName.trim(),
                companyName,
                client.getDocumentNumber() != null ? client.getDocumentNumber() : "NIT-S/N",
                score,
                tier,
                badgeColor,
                totalContracts,
                completedContracts,
                activeContracts,
                lateReturns,
                damageIncidents,
                punctualityRate,
                depositDiscount,
                benefits,
                recommendation,
                Instant.now()
        );
    }
}
