package com.renta.domain.purity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Pruebas de Arquitectura y Pureza del Dominio (R4)")
class DomainPurityTest {

    private static final Pattern FORBIDDEN_IMPORT_PATTERN = Pattern.compile(
            "^import\\s+(org\\.springframework|jakarta\\.persistence|com\\.fasterxml|org\\.hibernate|jakarta\\.validation)\\..*"
    );

    @Test
    @DisplayName("R4: Ningún archivo Java en src/main/java debe importar Spring, JPA, Jackson ni Hibernate")
    void shouldEnsureNoForbiddenImportsInProductionSource() throws IOException {
        Path mainJavaDir = Paths.get("src", "main", "java");
        assertTrue(Files.exists(mainJavaDir), "El directorio src/main/java debe existir");

        List<String> violations = new ArrayList<>();

        try (Stream<Path> stream = Files.walk(mainJavaDir)) {
            List<Path> javaFiles = stream.filter(p -> p.toString().endsWith(".java")).toList();
            assertFalse(javaFiles.isEmpty(), "Deben existir archivos Java de producción para analizar");

            for (Path javaFile : javaFiles) {
                List<String> lines = Files.readAllLines(javaFile);
                for (int i = 0; i < lines.size(); i++) {
                    String line = lines.get(i).trim();
                    if (FORBIDDEN_IMPORT_PATTERN.matcher(line).matches()) {
                        violations.add(String.format("Violación en %s (línea %d): %s", javaFile, i + 1, line));
                    }
                }
            }
        }

        assertTrue(violations.isEmpty(),
                "Se encontraron importaciones de frameworks prohibidos en el dominio puro:\n" + String.join("\n", violations));
    }

    @Test
    @DisplayName("R4: El archivo pom.xml del módulo no debe declarar dependencias en scope compile o runtime")
    void shouldEnsurePomDeclaresOnlyJUnitInTestScope() throws IOException {
        Path pomFile = Paths.get("pom.xml");
        assertTrue(Files.exists(pomFile), "El archivo pom.xml debe existir");

        String pomContent = Files.readString(pomFile);

        assertFalse(pomContent.contains("spring-boot-starter"), "pom.xml no debe contener starters de Spring Boot");
        assertFalse(pomContent.contains("jakarta.persistence"), "pom.xml no debe contener JPA");
        assertFalse(pomContent.contains("jackson"), "pom.xml no debe contener dependencias de Jackson");

        assertTrue(pomContent.contains("junit-jupiter"), "pom.xml debe declarar junit-jupiter para pruebas");
        assertTrue(pomContent.contains("<scope>test</scope>"), "junit-jupiter debe estar restringido a scope test");
    }
}
