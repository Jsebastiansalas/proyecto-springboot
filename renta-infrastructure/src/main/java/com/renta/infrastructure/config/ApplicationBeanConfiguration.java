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
import com.renta.domain.port.out.CategoryRepositoryPort;
import com.renta.domain.port.out.ClientRepositoryPort;
import com.renta.domain.port.out.DamageReportRepositoryPort;
import com.renta.domain.port.out.InvoiceRepositoryPort;
import com.renta.domain.port.out.NotificationServicePort;
import com.renta.domain.port.out.PaymentGatewayPort;
import com.renta.domain.port.out.PaymentRepositoryPort;
import com.renta.domain.port.out.ProviderRepositoryPort;
import com.renta.domain.port.out.RentalDeliveryRepositoryPort;
import com.renta.domain.port.out.RentalReturnRepositoryPort;
import com.renta.domain.port.out.ReservationRepositoryPort;
import com.renta.domain.port.out.ReviewRepositoryPort;
import com.renta.domain.port.out.ToolRepositoryPort;
import com.renta.domain.port.out.UserRepositoryPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApplicationBeanConfiguration {

    @Bean
    public AuthApplicationService authApplicationService(
            UserRepositoryPort userRepository,
            ClientRepositoryPort clientRepository,
            ProviderRepositoryPort providerRepository,
            PasswordEncoderPort passwordEncoder,
            TokenProviderPort tokenProvider) {
        return new AuthApplicationService(userRepository, clientRepository, providerRepository, passwordEncoder, tokenProvider);
    }

    @Bean
    public ToolApplicationService toolApplicationService(
            ToolRepositoryPort toolRepository,
            CategoryRepositoryPort categoryRepository,
            ProviderRepositoryPort providerRepository) {
        return new ToolApplicationService(toolRepository, categoryRepository, providerRepository);
    }

    @Bean
    public ReservationApplicationService reservationApplicationService(
            ReservationRepositoryPort reservationRepository,
            ToolRepositoryPort toolRepository,
            ClientRepositoryPort clientRepository,
            NotificationServicePort notificationService) {
        return new ReservationApplicationService(reservationRepository, toolRepository, clientRepository, notificationService);
    }

    @Bean
    public PaymentApplicationService paymentApplicationService(
            PaymentRepositoryPort paymentRepository,
            ReservationRepositoryPort reservationRepository,
            InvoiceRepositoryPort invoiceRepository,
            PaymentGatewayPort paymentGateway,
            NotificationServicePort notificationService) {
        return new PaymentApplicationService(paymentRepository, reservationRepository, invoiceRepository, paymentGateway, notificationService);
    }

    @Bean
    public InvoiceApplicationService invoiceApplicationService(
            InvoiceRepositoryPort invoiceRepository,
            ReservationRepositoryPort reservationRepository,
            PaymentRepositoryPort paymentRepository,
            ClientRepositoryPort clientRepository,
            ToolRepositoryPort toolRepository) {
        return new InvoiceApplicationService(invoiceRepository, reservationRepository, paymentRepository, clientRepository, toolRepository);
    }

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

    @Bean
    public ReviewApplicationService reviewApplicationService(
            ReviewRepositoryPort reviewRepository,
            ReservationRepositoryPort reservationRepository,
            ClientRepositoryPort clientRepository) {
        return new ReviewApplicationService(reviewRepository, reservationRepository, clientRepository);
    }

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
