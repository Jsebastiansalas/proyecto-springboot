package com.renta.application.service;

import com.renta.application.dto.maintenance.FinishMaintenanceRequest;
import com.renta.application.dto.maintenance.ScheduleMaintenanceRequest;
import com.renta.application.dto.maintenance.ToolMaintenanceResponse;
import com.renta.domain.exception.ResourceNotFoundException;
import com.renta.domain.model.entity.Tool;
import com.renta.domain.model.entity.ToolMaintenance;
import com.renta.domain.model.enums.MaintenanceStatus;
import com.renta.domain.model.enums.MaintenanceType;
import com.renta.domain.model.enums.ToolStatus;
import com.renta.domain.model.vo.Money;
import com.renta.domain.port.out.ToolMaintenanceRepositoryPort;
import com.renta.domain.port.out.ToolRepositoryPort;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public class ToolMaintenanceApplicationService {

    private final ToolMaintenanceRepositoryPort maintenanceRepository;
    private final ToolRepositoryPort toolRepository;

    public ToolMaintenanceApplicationService(
            ToolMaintenanceRepositoryPort maintenanceRepository,
            ToolRepositoryPort toolRepository) {
        this.maintenanceRepository = Objects.requireNonNull(maintenanceRepository, "maintenanceRepository es obligatorio");
        this.toolRepository = Objects.requireNonNull(toolRepository, "toolRepository es obligatorio");
    }

    /**
     * Pone una herramienta en MANTENIMIENTO y registra la orden técnica.
     */
    public ToolMaintenanceResponse scheduleMaintenance(ScheduleMaintenanceRequest request) {
        Tool tool = toolRepository.findById(request.toolId())
                .orElseThrow(() -> new ResourceNotFoundException("Herramienta no encontrada con ID: " + request.toolId()));

        MaintenanceType type = MaintenanceType.valueOf(request.maintenanceType().toUpperCase());
        Money cost = request.estimatedCost() != null ? Money.of(request.estimatedCost()) : Money.zero();

        ToolMaintenance maintenance = new ToolMaintenance(
                null,
                tool.getId(),
                type,
                request.startDate(),
                request.estimatedEndDate(),
                cost,
                request.technicianName(),
                request.description(),
                MaintenanceStatus.EN_PROCESO,
                Instant.now()
        );

        // Actualizar el estado de la herramienta a MANTENIMIENTO en la raíz de agregado
        tool.setStatus(ToolStatus.MANTENIMIENTO);
        toolRepository.save(tool);

        ToolMaintenance saved = maintenanceRepository.save(maintenance);

        return toResponse(saved, tool, "Herramienta puesta en MANTENIMIENTO y bloqueada para nuevos alquileres.");
    }

    /**
     * Finaliza el mantenimiento y restaura la herramienta a estado DISPONIBLE.
     */
    public ToolMaintenanceResponse finishMaintenance(Long maintenanceId, FinishMaintenanceRequest request) {
        ToolMaintenance maintenance = maintenanceRepository.findById(maintenanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de mantenimiento no encontrado: " + maintenanceId));

        Money finalCost = request.finalCost() != null ? Money.of(request.finalCost()) : maintenance.getCost();
        maintenance.complete(request.completionDate(), finalCost, request.resolutionNotes());
        ToolMaintenance saved = maintenanceRepository.save(maintenance);

        // Restaurar estado de la herramienta a DISPONIBLE
        Tool tool = toolRepository.findById(maintenance.getToolId())
                .orElseThrow(() -> new ResourceNotFoundException("Herramienta no encontrada"));
        tool.setStatus(ToolStatus.DISPONIBLE);
        toolRepository.save(tool);

        return toResponse(saved, tool, "Mantenimiento finalizado con éxito. Herramienta reincorporada al catálogo DISPONIBLE.");
    }

    public List<ToolMaintenanceResponse> listByToolId(Long toolId) {
        Tool tool = toolRepository.findById(toolId)
                .orElseThrow(() -> new ResourceNotFoundException("Herramienta no encontrada"));

        return maintenanceRepository.findByToolId(toolId).stream()
                .map(m -> toResponse(m, tool, null))
                .collect(Collectors.toList());
    }

    private ToolMaintenanceResponse toResponse(ToolMaintenance m, Tool tool, String message) {
        return new ToolMaintenanceResponse(
                m.getId(),
                m.getToolId(),
                tool.getName(),
                tool.getCodeSku(),
                m.getType().name(),
                m.getStartDate(),
                m.getEndDate(),
                m.getCost().amount(),
                m.getTechnicianName(),
                m.getDescription(),
                m.getStatus().name(),
                message
        );
    }
}
