package com.renta.boot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * ============================================================================
 * CLASE PRINCIPAL DE ARRANQUE: SPRING BOOT APPLICATION & TOMCAT INITIALIZER
 * ============================================================================
 * 
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Es el punto de inicio de ejecución de todo el ecosistema Spring Boot.
 * Contiene el método `main(String[] args)` que inicializa el contexto de Spring,
 * escanea los componentes `@Component`, `@Service`, `@RestController` y levanta
 * el servidor Tomcat embebido en el puerto 8080.
 * 
 * ¿POR QUÉ HEREDA DE SpringBootServletInitializer?
 * Para soportar DESPLIEGUE DUAL:
 * 1. Modo Standalone (Embebido): Ejecutar directamente con `java -jar renta-api.war`.
 * 2. Modo Contenedor de Servlets Externo: Permite desplegar el archivo `.war` dentro
 *    de un servidor de aplicaciones formal corporativo como Apache Tomcat 10.1
 *    (compatible con la especificación Jakarta EE 10 / Servlet 6.0).
 * 
 * ¿POR QUÉ SE USAN @EntityScan Y @EnableJpaRepositories CON RUTAS EXPLÍCITAS?
 * Dado que el proyecto usa Arquitectura Hexagonal Multi-Módulo Maven, las entidades
 * JPA y los repositorios de Spring Data se encuentran ubicados en el módulo
 * hermano `renta-infrastructure`. Estas anotaciones le indican a Spring exactamente
 * en qué paquetes escanear las tablas relacionales para evitar problemas de descubrimiento.
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
