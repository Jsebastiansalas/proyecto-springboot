package com.renta.domain.model.entity;

import com.renta.domain.model.enums.PricingTierType;
import com.renta.domain.model.enums.ToolStatus;
import com.renta.domain.model.vo.Money;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Adversarial Suite - Tool Encapsulation & Immutability Guardrails")
class ToolEncapsulationAdversarialTest {

    private Tool tool;

    @BeforeEach
    void setUp() {
        tool = Tool.create(
                10L,
                5,
                "SKU-ENCAP-001",
                "Martillo Demoledor 30kg",
                "Makita",
                "HM1812",
                "Martillo hexagonal 2000W",
                Money.cop(120_000),
                Money.cop(500_000)
        );
        tool.setId(888L);

        // Prepopulate with one element each via domain methods
        tool.addImage(new ToolImage(1L, 888L, "https://cdn.renta.com/makita1.jpg", true, "Vista frontal"));
        tool.addSpecification(new ToolSpecification(1L, 888L, "Potencia", "2000W"));
        tool.addPricingTier(new ToolPricingTier(1L, 888L, PricingTierType.SEMANAL, 7, Money.cop(102_000)));
        tool.addSafetyRequirement(new ToolSafetyRequirement(1L, 888L, "EPP Obligatorio", "Botas con puntera de acero"));
    }

    @Test
    @DisplayName("Images collection cannot be modified externally (add, remove, clear MUST throw UnsupportedOperationException)")
    void testImagesCollectionImmutability() {
        List<ToolImage> images = tool.getImages();
        assertEquals(1, images.size());

        ToolImage externalImage = new ToolImage(2L, 888L, "https://cdn.renta.com/hack.jpg", false, "Injected");

        // External add
        assertThrows(UnsupportedOperationException.class, () -> images.add(externalImage));

        // External remove
        assertThrows(UnsupportedOperationException.class, () -> images.remove(0));

        // External clear
        assertThrows(UnsupportedOperationException.class, images::clear);

        // Verify tool state was untouched
        assertEquals(1, tool.getImages().size());
        assertEquals("https://cdn.renta.com/makita1.jpg", tool.getImages().get(0).getImageUrl());
    }

    @Test
    @DisplayName("Specifications collection cannot be modified externally (add, remove, clear MUST throw UnsupportedOperationException)")
    void testSpecificationsCollectionImmutability() {
        List<ToolSpecification> specs = tool.getSpecifications();
        assertEquals(1, specs.size());

        ToolSpecification externalSpec = new ToolSpecification(2L, 888L, "Injected", "123");

        // External add
        assertThrows(UnsupportedOperationException.class, () -> specs.add(externalSpec));

        // External remove
        assertThrows(UnsupportedOperationException.class, () -> specs.remove(0));

        // External clear
        assertThrows(UnsupportedOperationException.class, specs::clear);

        // Verify tool state was untouched
        assertEquals(1, tool.getSpecifications().size());
        assertEquals("Potencia", tool.getSpecifications().get(0).getSpecName());
    }

    @Test
    @DisplayName("Pricing tiers collection cannot be modified externally (add, remove, clear MUST throw UnsupportedOperationException)")
    void testPricingTiersCollectionImmutability() {
        List<ToolPricingTier> tiers = tool.getPricingTiers();
        assertEquals(1, tiers.size());

        ToolPricingTier externalTier = new ToolPricingTier(2L, 888L, PricingTierType.MENSUAL, 30, Money.cop(80_000));

        // External add
        assertThrows(UnsupportedOperationException.class, () -> tiers.add(externalTier));

        // External remove
        assertThrows(UnsupportedOperationException.class, () -> tiers.remove(0));

        // External clear
        assertThrows(UnsupportedOperationException.class, tiers::clear);

        // Verify tool state was untouched
        assertEquals(1, tool.getPricingTiers().size());
        assertEquals(PricingTierType.SEMANAL, tool.getPricingTiers().get(0).getTierType());
    }

    @Test
    @DisplayName("Safety requirements collection cannot be modified externally (add, remove, clear MUST throw UnsupportedOperationException)")
    void testSafetyRequirementsCollectionImmutability() {
        List<ToolSafetyRequirement> reqs = tool.getSafetyRequirements();
        assertEquals(1, reqs.size());

        ToolSafetyRequirement externalReq = new ToolSafetyRequirement(2L, 888L, "Hack", "Desc");

        // External add
        assertThrows(UnsupportedOperationException.class, () -> reqs.add(externalReq));

        // External remove
        assertThrows(UnsupportedOperationException.class, () -> reqs.remove(0));

        // External clear
        assertThrows(UnsupportedOperationException.class, reqs::clear);

        // Verify tool state was untouched
        assertEquals(1, tool.getSafetyRequirements().size());
        assertEquals("EPP Obligatorio", tool.getSafetyRequirements().get(0).getRequirementName());
    }

    @Test
    @DisplayName("External collection passed to addAll methods does not allow external manipulation of tool state")
    void testDefensiveCollectionIngestion() {
        List<ToolImage> inputImages = new ArrayList<>();
        inputImages.add(new ToolImage(2L, 888L, "https://cdn.renta.com/makita2.jpg", false, "Vista lateral"));
        tool.addAllImages(inputImages);

        assertEquals(2, tool.getImages().size());

        // Modifying inputImages externally should not affect tool's collection
        inputImages.clear();
        assertEquals(2, tool.getImages().size());
    }
}
