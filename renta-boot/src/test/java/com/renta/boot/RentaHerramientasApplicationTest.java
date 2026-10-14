package com.renta.boot;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class RentaHerramientasApplicationTest {

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private DataSource dataSource;

    @Test
    @DisplayName("El contexto de Spring Boot y la conexión a PostgreSQL 18 cargan exitosamente")
    void contextLoadsAndDatabaseConnects() throws Exception {
        assertNotNull(applicationContext, "El contexto de Spring Boot debe haberse inicializado");
        assertNotNull(dataSource, "El DataSource debe estar configurado");

        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement();
             ResultSet rs = statement.executeQuery("SELECT count(*) FROM users")) {
            assertTrue(rs.next());
            int userCount = rs.getInt(1);
            assertTrue(userCount >= 20, "Deben existir al menos 20 usuarios sembrados en la base de datos");
        }
    }
}
