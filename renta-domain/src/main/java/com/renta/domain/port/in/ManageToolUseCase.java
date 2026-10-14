package com.renta.domain.port.in;

import com.renta.domain.model.entity.Tool;
import com.renta.domain.model.enums.ToolStatus;

/**
 * Inbound port for managing tool inventory and maintenance status.
 */
public interface ManageToolUseCase {

    Tool registerTool(Tool tool);

    void updateToolStatus(Long toolId, ToolStatus newStatus);
}
