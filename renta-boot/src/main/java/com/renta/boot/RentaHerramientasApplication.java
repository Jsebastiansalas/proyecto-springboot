package com.renta.boot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Punto de entrada principal de la Plataforma de Renta de Herramientas y Equipos.
 * Soporta ejecución dual:
 * 1. Embebida en desarrollo/Docker (java -jar renta-api.war o mvn spring-boot:run)
 * 2. Despliegue nativo como WAR en Apache Tomcat 10+ (Jakarta EE 10)
 */
@SpringBootApplication(scanBasePackages = "com.renta")
@EntityScan(basePackages = "com.renta.infrastructure.adapter.out.persistence.entity")
@EnableJpaRepositories(basePackages = "com.renta.infrastructure.adapter.out.persistence.repository")
public class RentaHerramientasApplication extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        return builder.sources(RentaHerramientasApplication.class);
    }

    public static void main(String[] args) {
        SpringApplication.run(RentaHerramientasApplication.class, args);
    }
}
