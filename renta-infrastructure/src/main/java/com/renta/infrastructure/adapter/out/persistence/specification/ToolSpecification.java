package com.renta.infrastructure.adapter.out.persistence.specification;

import com.renta.infrastructure.adapter.out.persistence.entity.ToolJpaEntity;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * ============================================================================
 * JPA SPECIFICATION: FILTRADO DINÁMICO DE HERRAMIENTAS (CRITERIA API)
 * ============================================================================
 * Permite combinar libremente criterios de búsqueda:
 * - query: busca en nombre, marca, modelo o SKU
 * - categoryId: ID de categoría
 * - brand: marca específica (ej. 'Bosch', 'DeWalt', 'Caterpillar')
 * - minPrice / maxPrice: rango de tarifa base diaria
 * - status: estado (por defecto 'DISPONIBLE')
 */
public class ToolSpecification {

    public static Specification<ToolJpaEntity> filter(
            String query,
            Integer categoryId,
            String brand,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String status) {

        return (root, criteriaQuery, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Filtro por texto libre (nombre, marca, modelo o SKU)
            if (query != null && !query.trim().isEmpty()) {
                String pattern = "%" + query.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);
                Predicate brandMatch = cb.like(cb.lower(root.get("brand")), pattern);
                Predicate modelMatch = cb.like(cb.lower(root.get("model")), pattern);
                Predicate skuMatch = cb.like(cb.lower(root.get("codeSku")), pattern);
                predicates.add(cb.or(nameMatch, brandMatch, modelMatch, skuMatch));
            }

            // 2. Filtro por categoría
            if (categoryId != null && categoryId > 0) {
                predicates.add(cb.equal(root.get("categoryId"), categoryId));
            }

            // 3. Filtro por marca exacta
            if (brand != null && !brand.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("brand")), brand.trim().toLowerCase()));
            }

            // 4. Rango de precios
            if (minPrice != null && minPrice.compareTo(BigDecimal.ZERO) > 0) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("baseDailyPrice"), minPrice));
            }
            if (maxPrice != null && maxPrice.compareTo(BigDecimal.ZERO) > 0) {
                predicates.add(cb.lessThanOrEqualTo(root.get("baseDailyPrice"), maxPrice));
            }

            // 5. Estado
            if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
