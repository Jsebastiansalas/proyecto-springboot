package com.renta.domain.port.out;

import com.renta.domain.model.entity.Tool;
import com.renta.domain.model.enums.ToolStatus;
import com.renta.domain.model.vo.DateRange;

import java.util.List;
import java.util.Optional;

/**
 * Outbound repository port for {@link Tool} persistence and queries.
 */
public interface ToolRepositoryPort {

    Tool save(Tool tool);

    Optional<Tool> findById(Long id);

    Optional<Tool> findByCodeSku(String codeSku);

    List<Tool> findByCategoryId(Integer categoryId);

    List<Tool> findByProviderId(Long providerId);

    List<Tool> findByStatus(ToolStatus status);

    List<Tool> findAllAvailable();

    boolean existsById(Long id);

    boolean existsOverlappingReservation(Long toolId, DateRange dateRange);
}
