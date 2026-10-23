package com.renta.domain.port.out;

import com.renta.domain.model.entity.ToolMaintenance;

import java.util.List;
import java.util.Optional;

public interface ToolMaintenanceRepositoryPort {

    ToolMaintenance save(ToolMaintenance maintenance);

    Optional<ToolMaintenance> findById(Long id);

    List<ToolMaintenance> findByToolId(Long toolId);

    List<ToolMaintenance> findAllActive();
}
