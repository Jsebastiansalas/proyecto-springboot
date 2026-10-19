package com.renta.infrastructure.config;

import com.renta.application.port.out.PasswordEncoderPort;
import com.renta.application.port.out.TokenProviderPort;
import com.renta.application.service.AuthApplicationService;
import com.renta.application.service.DeliveryReturnApplicationService;
import com.renta.application.service.InvoiceApplicationService;
import com.renta.application.service.PaymentApplicationService;
import com.renta.application.service.ReportApplicationService;
import com.renta.application.service.ReservationApplicationService;
import com.renta.application.service.ReviewApplicationService;
import com.renta.application.service.ToolApplicationService;
import com.renta.application.service.ToolCommentApplicationService;
import com.renta.domain.port.out.CategoryRepositoryPort;
import com.renta.domain.port.out.ClientRepositoryPort;
import com.renta.domain.port.out.DamageReportRepositoryPort;
import com.renta.domain.port.out.InvoiceRepositoryPort;
import com.renta.domain.port.out.NotificationServicePort;
import com.renta.domain.port.out.PaymentGatewayPort;
import com.renta.domain.port.out.PaymentInstallmentRepositoryPort;
import com.renta.domain.port.out.PaymentRepositoryPort;
import com.renta.domain.port.out.ProviderRepositoryPort;
import com.renta.domain.port.out.RentalDeliveryRepositoryPort;
import com.renta.domain.port.out.RentalReturnRepositoryPort;
import com.renta.domain.port.out.ReservationRepositoryPort;
import com.renta.domain.port.out.ReviewRepositoryPort;
import com.renta.domain.port.out.ToolCommentRepositoryPort;
import com.renta.domain.port.out.ToolRepositoryPort;
import com.renta.domain.port.out.UserRepositoryPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * ============================================================================
 * CONFIGURACIÓN CENTRAL DE BEANS DE APLICACIÓN (INYECCIÓN DE DEPENDENCIAS)
 * ============================================================================
 * 
 * ¿POR QUÉ EXISTE ESTA CLASE Y NO USAMOS @Service EN CADA CLASE?
 * En una arquitectura hexagonal estricta:
 * 1. El módulo `renta-domain` y `renta-application` son JAVA PURO. No tienen
 *    dependencias de Spring Boot, por lo que NO usan `@Service` ni `@Component`.
 * 2. Como Spring no puede ver anotaciones allí, necesita una "fábrica" que le
 *    indique cómo instanciar cada servicio y qué repositorios inyectarle.
 * 3. Esta clase `@Configuration` es ese puente: toma los repositorios de
 *    infraestructura (que sí son Beans de Spring) y se los entrega a los
 *    constructores de nuestros servicios de negocio.
 * 
 * BENEFICIO PARA EL PROGRAMADOR:
 * Si en el futuro cambias Spring Boot por otro framework, tu lógica de negocio
 * en `renta-application` no se altera en absoluto.
 */
@Configuration
public class ApplicationBeanConfiguration {

    /**
     * SERVICIO DE AUTENTICACIÓN Y REGISTRO
     * Gestiona el registro de clientes/proveedores, login y emisión de JWT.
     */
    @Bean
    public AuthApplicationService authApplicationService(
            UserRepositoryPort userRepository,
            ClientRepositoryPort clientRepository,
            ProviderRepositoryPort providerRepository,
            PasswordEncoderPort passwordEncoder,
            TokenProviderPort tokenProvider) {
        return new AuthApplicationService(userRepository, clientRepository, providerRepository, passwordEncoder, tokenProvider);
    }

    /**
     * SERVICIO DE CATÁLOGO DE HERRAMIENTAS
     * Gestiona la creación, edición, categorización y consulta de maquinaria.
     */
    @Bean
    public ToolApplicationService toolApplicationService(
            ToolRepositoryPort toolRepository,
            CategoryRepositoryPort categoryRepository,
            ProviderRepositoryPort providerRepository,
            ReviewRepositoryPort reviewRepository) {
        return new ToolApplicationService(toolRepository, categoryRepository, providerRepository, reviewRepository);
    }

    /**
     * SERVICIO DE RESERVAS Y COTIZACIÓN
     * Valida solapamiento de fechas, disponibilidad de herramientas y cálculos de tarifas con IVA.
     */
    @Bean
    public ReservationApplicationService reservationApplicationService(
            ReservationRepositoryPort reservationRepository,
            ToolRepositoryPort toolRepository,
            ClientRepositoryPort clientRepository,
            NotificationServicePort notificationService,
            PaymentRepositoryPort paymentRepository) {
        return new ReservationApplicationService(reservationRepository, toolRepository, clientRepository, notificationService, paymentRepository);
    }

    /**
     * SERVICIO DE PAGOS
     * Procesa pagos simulados de alquiler y depósito de garantía, cronograma de cuotas y genera la factura.
     */
    @Bean
    public PaymentApplicationService paymentApplicationService(
            PaymentRepositoryPort paymentRepository,
            ReservationRepositoryPort reservationRepository,
            InvoiceRepositoryPort invoiceRepository,
            PaymentGatewayPort paymentGateway,
            NotificationServicePort notificationService,
            PaymentInstallmentRepositoryPort paymentInstallmentRepository) {
        return new PaymentApplicationService(paymentRepository, reservationRepository, invoiceRepository, paymentGateway, notificationService, paymentInstallmentRepository);
    }

    /**
     * SERVICIO DE MURO DE PREGUNTAS Y COMENTARIOS
     * Permite a clientes preguntar sobre maquinaria y a proveedores responder públicamente.
     */
    @Bean
    public ToolCommentApplicationService toolCommentApplicationService(
            ToolCommentRepositoryPort toolCommentRepository,
            ToolRepositoryPort toolRepository) {
        return new ToolCommentApplicationService(toolCommentRepository, toolRepository);
    }

    /**
     * SERVICIO DE FACTURACIÓN
     * Emite facturas electrónicas comerciales cumpliendo con el desglose del IVA 19%.
     */
    @Bean
    public InvoiceApplicationService invoiceApplicationService(
            InvoiceRepositoryPort invoiceRepository,
            ReservationRepositoryPort reservationRepository,
            PaymentRepositoryPort paymentRepository,
            ClientRepositoryPort clientRepository,
            ToolRepositoryPort toolRepository) {
        return new InvoiceApplicationService(invoiceRepository, reservationRepository, paymentRepository, clientRepository, toolRepository);
    }

    /**
     * SERVICIO DE LOGÍSTICA (ENTREGAS, DEVOLUCIONES Y LIQUIDACIÓN)
     * Registra las actas de despacho en obra, recepción física de equipos,
     * cálculo automático de averías y liquidación neta del depósito de garantía.
     */
    @Bean
    public DeliveryReturnApplicationService deliveryReturnApplicationService(
            RentalDeliveryRepositoryPort deliveryRepository,
            RentalReturnRepositoryPort returnRepository,
            DamageReportRepositoryPort damageReportRepository,
            ReservationRepositoryPort reservationRepository,
            ToolRepositoryPort toolRepository,
            ClientRepositoryPort clientRepository) {
        return new DeliveryReturnApplicationService(
                deliveryRepository, returnRepository, damageReportRepository,
                reservationRepository, toolRepository, clientRepository);
    }

    /**
     * SERVICIO DE CALIFICACIONES Y RESEÑAS
     * Permite que clientes valoren de 1 a 5 estrellas los equipos alquilados.
     */
    @Bean
    public ReviewApplicationService reviewApplicationService(
            ReviewRepositoryPort reviewRepository,
            ReservationRepositoryPort reservationRepository,
            ClientRepositoryPort clientRepository) {
        return new ReviewApplicationService(reviewRepository, reservationRepository, clientRepository);
    }

    /**
     * SERVICIO DE REPORTES Y MÉTRICAS
     * Consolida estadísticas de ingresos, reservas activas y herramientas para paneles administrativos.
     */
    @Bean
    public ReportApplicationService reportApplicationService(
            ToolRepositoryPort toolRepository,
            ReservationRepositoryPort reservationRepository,
            ProviderRepositoryPort providerRepository,
            ClientRepositoryPort clientRepository,
            UserRepositoryPort userRepository,
            PaymentRepositoryPort paymentRepository) {
        return new ReportApplicationService(toolRepository, reservationRepository, providerRepository, clientRepository, userRepository, paymentRepository);
    }
}
