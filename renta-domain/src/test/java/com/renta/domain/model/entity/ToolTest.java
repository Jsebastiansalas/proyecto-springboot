package com.renta.domain.model.entity;

import com.renta.domain.model.enums.PricingTierType;
import com.renta.domain.model.enums.ToolStatus;
import com.renta.domain.model.vo.Money;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Pruebas Unitarias - Agregado Tool y Colecciones 4NF")
class ToolTest {

    @Test
    @DisplayName("Gestión de colecciones 4NF en el agregado Tool")
    void shouldManage4NFCollectionsCorrectly() {
        Tool tool = Tool.create(
                1L,
                2,
                "HERR-9999",
                "Compresor de Aire 50L",
                "DeWalt",
                "D55146",
                "Compresor 225 PSI",
                Money.cop(60_000),
                Money.cop(200_000)
        );
        tool.setId(500L);

        // 1. ToolImage
        tool.addImage(new ToolImage(null, 500L, "https://cdn.renta.com/compresor1.jpg", true, "Vista frontal"));
        assertEquals(1, tool.getImages().size());
        assertTrue(tool.getImages().get(0).isPrimary());

        // 2. ToolSpecification
        tool.addSpecification(new ToolSpecification(null, 500L, "Presión Máxima", "225 PSI"));
        tool.addSpecification(new ToolSpecification(null, 500L, "Capacidad Tanque", "50 Litros"));
        assertEquals(2, tool.getSpecifications().size());

        // 3. ToolPricingTier
        tool.addPricingTier(new ToolPricingTier(null, 500L, PricingTierType.SEMANAL, 7, Money.cop(51_000)));
        assertEquals(1, tool.getPricingTiers().size());
        assertEquals(new BigDecimal("51000.00"), tool.getPricingTiers().get(0).getPricePerDay().amount());

        // 4. ToolSafetyRequirement
        tool.addSafetyRequirement(new ToolSafetyRequirement(null, 500L, "Protección Auditiva", "Uso obligatorio de orejeras"));
        assertEquals(1, tool.getSafetyRequirements().size());
    }

    @Test
    @DisplayName("Transiciones de estado del equipo")
    void shouldTransitionToolStatusCorrectly() {
        Tool tool = Tool.create(1L, 1, "HERR-1111", "Equipo", "Marca", "Mod", "Desc", Money.cop(10_000), Money.zero());

        assertTrue(tool.isAvailable());
        assertFalse(tool.isInMaintenance());

        tool.markInMaintenance();
        assertEquals(ToolStatus.MANTENIMIENTO, tool.getStatus());
        assertTrue(tool.isInMaintenance());
        assertFalse(tool.isAvailable());

        tool.markAvailable();
        assertEquals(ToolStatus.DISPONIBLE, tool.getStatus());
        assertTrue(tool.isAvailable());

        tool.markRented();
        assertEquals(ToolStatus.EN_USO, tool.getStatus());
        assertTrue(tool.getStatus().isRented());

        tool.markRetired();
        assertEquals(ToolStatus.RETIRADA, tool.getStatus());
        assertTrue(tool.getStatus().isRetired());
    }
}
