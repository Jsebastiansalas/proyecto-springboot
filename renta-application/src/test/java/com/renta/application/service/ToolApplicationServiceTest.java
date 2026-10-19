package com.renta.application.service;

import com.renta.application.dto.tool.CreateToolRequest;
import com.renta.application.dto.tool.ToolDetailResponse;
import com.renta.application.dto.tool.ToolImageDto;
import com.renta.application.dto.tool.ToolPricingTierDto;
import com.renta.application.dto.tool.ToolSafetyRequirementDto;
import com.renta.application.dto.tool.ToolSpecificationDto;
import com.renta.domain.exception.BusinessRuleViolationException;
import com.renta.domain.exception.ResourceNotFoundException;
import com.renta.domain.model.entity.Category;
import com.renta.domain.model.entity.Provider;
import com.renta.domain.model.entity.Tool;
import com.renta.domain.model.enums.PricingTierType;
import com.renta.domain.model.enums.ToolStatus;
import com.renta.domain.port.out.CategoryRepositoryPort;
import com.renta.domain.port.out.ProviderRepositoryPort;
import com.renta.domain.port.out.ToolRepositoryPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ToolApplicationServiceTest {

    @Mock
    private ToolRepositoryPort toolRepository;

    @Mock
    private CategoryRepositoryPort categoryRepository;

    @Mock
    private ProviderRepositoryPort providerRepository;

    @InjectMocks
    private ToolApplicationService toolService;

    private Category sampleCategory;
    private Provider sampleProvider;

    @BeforeEach
    void setUp() {
        sampleCategory = new Category();
        sampleCategory.setId(1);
        sampleCategory.setName("Maquinaria Pesada");

        sampleProvider = new Provider();
        sampleProvider.setId(2L);
        sampleProvider.setCompanyName("Equipos del Norte S.A.S.");
    }

    @Test
    @DisplayName("HU-01: Crear herramienta con 4FN (imágenes, especificaciones, tarifas, seguridad)")
    void testCreateTool_SuccessWith4FN() {
        when(categoryRepository.findById(1)).thenReturn(Optional.of(sampleCategory));
        when(providerRepository.findById(2L)).thenReturn(Optional.of(sampleProvider));
        when(toolRepository.findByCodeSku("MINI-001")).thenReturn(Optional.empty());

        Tool savedTool = new Tool();
        savedTool.setId(55L);
        savedTool.setCodeSku("MINI-001");
        savedTool.setName("Minicargador Bobcat S550");
        savedTool.setStatus(ToolStatus.DISPONIBLE);
        savedTool.setCategoryId(1);
        savedTool.setProviderId(2L);

        when(toolRepository.save(any(Tool.class))).thenReturn(savedTool);
        when(toolRepository.findById(55L)).thenReturn(Optional.of(savedTool));

        CreateToolRequest req = new CreateToolRequest(
                2L,
                1,
                "MINI-001",
                "Minicargador Bobcat S550",
                "Bobcat",
                "S550",
                "Minicargador de orugas para movimiento de tierras",
                new BigDecimal("350000.00"),
                new BigDecimal("1000000.00"),
                "https://images.unsplash.com/bobcat.jpg",
                List.of(new ToolImageDto(null, "https://images.unsplash.com/bobcat-detail.jpg", true, "Vista lateral")),
                List.of(new ToolSpecificationDto(null, "Capacidad Balde", "0.45 m3"), new ToolSpecificationDto(null, "Potencia", "61 HP")),
                List.of(
                        new ToolPricingTierDto(null, PricingTierType.DIARIO, 1, new BigDecimal("350000.00")),
                        new ToolPricingTierDto(null, PricingTierType.SEMANAL, 7, new BigDecimal("297500.00"))
                ),
                List.of(new ToolSafetyRequirementDto(null, "Casco y botas dieléctricas", "Obligatorio para operarios en obra"))
        );

        ToolDetailResponse res = toolService.createTool(req);

        assertNotNull(res);
        assertEquals(55L, res.id());
        assertEquals("MINI-001", res.codeSku());
        assertEquals(ToolStatus.DISPONIBLE, res.status());

        verify(toolRepository, times(1)).save(any(Tool.class));
        verify(toolRepository, times(1)).findById(55L);
    }

    @Test
    @DisplayName("Crear herramienta falla: Lanza excepción si el código SKU ya existe")
    void testCreateTool_ThrowsWhenDuplicateSku() {
        Tool existing = new Tool();
        existing.setId(99L);
        existing.setCodeSku("DUPLICADO-01");

        when(toolRepository.findByCodeSku("DUPLICADO-01")).thenReturn(Optional.of(existing));

        Tool newTool = new Tool();
        newTool.setCodeSku("DUPLICADO-01");

        assertThrows(BusinessRuleViolationException.class, () -> toolService.registerTool(newTool));
        verify(toolRepository, never()).save(any(Tool.class));
    }

    @Test
    @DisplayName("HU-02: Dar de baja herramienta transiciona su estado a RETIRADA")
    void testRetireTool_Success() {
        Tool tool = new Tool();
        tool.setId(40L);
        tool.setName("Andamio Tubo");
        tool.setStatus(ToolStatus.DISPONIBLE);

        when(toolRepository.findById(40L)).thenReturn(Optional.of(tool));
        when(toolRepository.save(any(Tool.class))).thenAnswer(i -> i.getArgument(0));

        toolService.updateToolStatus(40L, ToolStatus.RETIRADA);

        assertEquals(ToolStatus.RETIRADA, tool.getStatus());
        verify(toolRepository, times(1)).save(tool);
    }
}
