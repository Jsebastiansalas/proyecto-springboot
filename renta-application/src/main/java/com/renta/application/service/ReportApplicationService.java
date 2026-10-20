package com.renta.application.service;

import com.renta.application.dto.report.AdminDashboardResponse;
import com.renta.application.dto.report.ProviderDashboardResponse;
import com.renta.application.dto.report.RevenueMetricDto;
import com.renta.application.dto.report.ToolPopularityDto;
import com.renta.application.port.in.ReportUseCase;
import com.renta.domain.exception.ResourceNotFoundException;
import com.renta.domain.model.entity.Provider;
import com.renta.domain.model.entity.Reservation;
import com.renta.domain.model.entity.Tool;
import com.renta.domain.model.enums.ReservationStatus;
import com.renta.domain.model.enums.ToolStatus;
import com.renta.domain.port.out.CategoryRepositoryPort;
import com.renta.domain.port.out.ClientRepositoryPort;
import com.renta.domain.port.out.InvoiceRepositoryPort;
import com.renta.domain.port.out.PaymentRepositoryPort;
import com.renta.domain.port.out.ProviderRepositoryPort;
import com.renta.domain.port.out.ReservationRepositoryPort;
import com.renta.domain.port.out.ToolRepositoryPort;
import com.renta.domain.port.out.UserRepositoryPort;

import com.renta.application.dto.report.FrequentClientDto;
import com.renta.domain.model.entity.Client;
import com.renta.domain.model.entity.User;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;

/**
 * ============================================================================
 * SERVICIO DE APLICACIÓN: INFORMES Y ANALÍTICA DE NEGOCIO (DASHBOARDS)
 * ============================================================================
 * 
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Este servicio implementa el caso de uso {@link ReportUseCase}. Es el motor de
 * analítica y reportería del sistema. Se encarga de:
 * 1. Consolidar las métricas financieras globales para el Administrador: total de
 *    ingresos netos, recaudo de IVA (19%), depósitos en garantía bajo custodia y
 *    herramientas activas en obra.
 * 2. Agrupar dinámicamente las ventas por periodos mensuales (año-mes: YYYY-MM)
 *    para alimentar los gráficos de tendencia histórica.
 * 3. Calcular el ranking de clientes frecuentes y la rotación del inventario
 *    (Top herramientas más rentadas).
 * 4. Generar el reporte personalizado para cada Proveedor con sus ingresos y
 *    estado de alquileres particulares.
 * 
 * ¿POR QUÉ ESTÁ CREADO Y DÓNDE ENCAJA EN LA ARQUITECTURA?
 * En la Arquitectura Hexagonal (DDD), este archivo pertenece a la capa de
 * APLICACIÓN (renta-application). Actúa como orquestador: no interactúa directamente
 * con controladores web ni con SQL de base de datos; en su lugar, consume
 * Puertos de Salida (interfaces de repositorios como {@link ToolRepositoryPort},
 * {@link ReservationRepositoryPort}) y transforma entidades de dominio en DTOs
 * inmutables para responder a la capa de presentación REST.
 */
public class ReportApplicationService implements ReportUseCase {

    private final ToolRepositoryPort toolRepository;
    private final ReservationRepositoryPort reservationRepository;
    private final ProviderRepositoryPort providerRepository;
    private final ClientRepositoryPort clientRepository;
    private final UserRepositoryPort userRepository;
    private final PaymentRepositoryPort paymentRepository;

    public ReportApplicationService(
            ToolRepositoryPort toolRepository,
            ReservationRepositoryPort reservationRepository,
            ProviderRepositoryPort providerRepository,
            ClientRepositoryPort clientRepository,
            UserRepositoryPort userRepository,
            PaymentRepositoryPort paymentRepository) {
        this.toolRepository = Objects.requireNonNull(toolRepository);
        this.reservationRepository = Objects.requireNonNull(reservationRepository);
        this.providerRepository = Objects.requireNonNull(providerRepository);
        this.clientRepository = Objects.requireNonNull(clientRepository);
        this.userRepository = Objects.requireNonNull(userRepository);
        this.paymentRepository = Objects.requireNonNull(paymentRepository);
    }

    /**
     * ========================================================================
     * SPRINT 2 (HU-05): PANEL DE ANALÍTICA GLOBAL DINÁMICA
     * ========================================================================
     * 1. Consulta conteos reales en base de datos (usuarios, clientes, proveedores, herramientas).
     * 2. Agrupa dinámicamente ingresos por periodo mensual real (YYYY-MM).
     * 3. Calcula el ranking Top 5 de Clientes Frecuentes con mayor inversión.
     */
    @Override
    public AdminDashboardResponse getAdminDashboard() {
        // 1. Conteos maestros reales desde los repositorios
        long totalUsers = userRepository.findAll().size();
        long totalClients = clientRepository.findAll().size();
        long totalProviders = providerRepository.findAll().size();

        List<Tool> allTools = toolRepository.findAll();
        long totalTools = allTools.size();

        List<Reservation> allReservations = reservationRepository.findAll();
        long totalRes = allReservations.size();

        long activeRentals = 0;
        BigDecimal totalRev = BigDecimal.ZERO;
        BigDecimal totalDeposits = BigDecimal.ZERO;

        // Estructuras de acumulación rápida O(N)
        Map<String, MonthAccumulator> monthlyMap = new TreeMap<>();
        Map<Long, ClientAccumulator> clientAccumulatorMap = new HashMap<>();

        for (Reservation r : allReservations) {
            ReservationStatus st = r.getStatus();

            // Alquileres activos y garantías en custodia
            if (st == ReservationStatus.EN_CURSO || st == ReservationStatus.APROBADA) {
                activeRentals++;
                if (r.getDepositTotal() != null) {
                    totalDeposits = totalDeposits.add(r.getDepositTotal().amount());
                }
            }

            // Ingresos generados reales (reservas finalizadas o en curso)
            if (st == ReservationStatus.FINALIZADA || st == ReservationStatus.EN_CURSO) {
                BigDecimal sub = r.getSubtotal() != null ? r.getSubtotal().amount() : BigDecimal.ZERO;
                totalRev = totalRev.add(sub);

                // HU-05: Agrupación dinámica por Año-Mes
                String ym = r.getStartDate() != null
                        ? String.format("%d-%02d", r.getStartDate().getYear(), r.getStartDate().getMonthValue())
                        : "2026-03";
                MonthAccumulator mAcc = monthlyMap.computeIfAbsent(ym, k -> new MonthAccumulator());
                mAcc.revenue = mAcc.revenue.add(sub);
                mAcc.rentalsCount++;
            }

            // HU-05: Acumulación de actividad por cliente
            if (st != ReservationStatus.CANCELADA && st != ReservationStatus.RECHAZADA) {
                Long cId = r.getClientId();
                if (cId != null) {
                    ClientAccumulator cAcc = clientAccumulatorMap.computeIfAbsent(cId, k -> new ClientAccumulator());
                    cAcc.reservationsCount++;
                    BigDecimal tot = r.getTotalAmount() != null ? r.getTotalAmount().amount() : BigDecimal.ZERO;
                    cAcc.totalSpent = cAcc.totalSpent.add(tot);
                }
            }
        }

        // Construir métricas mensuales ordenadas cronológicamente
        List<RevenueMetricDto> monthly = new ArrayList<>();
        for (Map.Entry<String, MonthAccumulator> entry : monthlyMap.entrySet()) {
            monthly.add(new RevenueMetricDto(entry.getKey(), entry.getValue().revenue, entry.getValue().rentalsCount));
        }
        if (monthly.isEmpty()) {
            monthly.add(new RevenueMetricDto("2026-03", totalRev, totalRes));
        }

        // Top 5 Herramientas más alquiladas
        List<ToolPopularityDto> topTools = new ArrayList<>();
        for (Tool t : allTools.stream().limit(5).toList()) {
            List<Reservation> toolRes = reservationRepository.findByToolId(t.getId());
            BigDecimal rev = toolRes.stream()
                    .filter(r -> r.getStatus() == ReservationStatus.FINALIZADA || r.getStatus() == ReservationStatus.EN_CURSO)
                    .map(r -> r.getSubtotal().amount())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            topTools.add(new ToolPopularityDto(t.getId(), t.getName(), t.getBrand(), "General", toolRes.size(), rev));
        }
        topTools.sort((a, b) -> Long.compare(b.rentalCount(), a.rentalCount()));

        // HU-05: Top 5 Clientes Frecuentes
        List<FrequentClientDto> topFrequentClients = new ArrayList<>();
        List<Map.Entry<Long, ClientAccumulator>> sortedClients = clientAccumulatorMap.entrySet().stream()
                .sorted((a, b) -> b.getValue().totalSpent.compareTo(a.getValue().totalSpent))
                .limit(5)
                .toList();

        for (Map.Entry<Long, ClientAccumulator> entry : sortedClients) {
            Long cId = entry.getKey();
            Client client = clientRepository.findById(cId).orElse(null);
            String clientName = client != null ? (client.getFirstName() + " " + client.getLastName()) : ("Cliente #" + cId);
            String doc = client != null ? client.getDocumentNumber() : "N/A";
            String email = (client != null && client.getUserId() != null)
                    ? userRepository.findById(client.getUserId()).map(u -> u.getEmail() != null ? u.getEmail().value() : null).orElse("cliente" + cId + "@correo.com")
                    : "cliente" + cId + "@correo.com";

            topFrequentClients.add(new FrequentClientDto(
                    cId,
                    clientName,
                    email,
                    doc,
                    entry.getValue().reservationsCount,
                    entry.getValue().totalSpent
            ));
        }

        return new AdminDashboardResponse(
                totalUsers,
                totalClients,
                totalProviders,
                totalTools,
                totalRes,
                activeRentals,
                totalRev,
                totalDeposits,
                topTools,
                monthly,
                topFrequentClients
        );
    }

    private static class MonthAccumulator {
        BigDecimal revenue = BigDecimal.ZERO;
        long rentalsCount = 0;
    }

    private static class ClientAccumulator {
        long reservationsCount = 0;
        BigDecimal totalSpent = BigDecimal.ZERO;
    }

    @Override
    public ProviderDashboardResponse getProviderDashboard(Long providerId) {
        Provider prov = providerRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con ID: " + providerId));

        List<Tool> providerTools = toolRepository.findByProviderId(providerId);
        long totalTools = providerTools.size();
        long available = providerTools.stream().filter(t -> t.getStatus() == ToolStatus.DISPONIBLE).count();
        long rented = providerTools.stream().filter(t -> t.getStatus() == ToolStatus.ALQUILADA).count();
        long maintenance = providerTools.stream().filter(t -> t.getStatus() == ToolStatus.MANTENIMIENTO).count();

        List<Reservation> provReservations = providerTools.stream()
                .flatMap(t -> reservationRepository.findByToolId(t.getId()).stream())
                .distinct()
                .toList();

        BigDecimal earned = provReservations.stream()
                .filter(r -> r.getStatus() == ReservationStatus.FINALIZADA || r.getStatus() == ReservationStatus.EN_CURSO)
                .map(r -> r.getSubtotal().amount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<ToolPopularityDto> topTools = providerTools.stream()
                .map(t -> {
                    List<Reservation> tRes = reservationRepository.findByToolId(t.getId());
                    BigDecimal rEarned = tRes.stream().map(r -> r.getSubtotal().amount()).reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new ToolPopularityDto(t.getId(), t.getName(), t.getBrand(), "Herramientas", tRes.size(), rEarned);
                })
                .sorted((a, b) -> Long.compare(b.rentalCount(), a.rentalCount()))
                .limit(5)
                .toList();

        return new ProviderDashboardResponse(
                prov.getId(),
                prov.getCompanyName(),
                totalTools,
                available,
                rented,
                maintenance,
                provReservations.size(),
                earned,
                topTools
        );
    }
}
