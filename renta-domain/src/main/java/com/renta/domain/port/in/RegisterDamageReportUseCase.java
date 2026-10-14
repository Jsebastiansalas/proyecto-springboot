package com.renta.domain.port.in;

import com.renta.domain.model.entity.DamageReport;
import com.renta.domain.model.enums.DamageType;
import com.renta.domain.model.vo.Money;

/**
 * Inbound port for recording incident reports and damage assessments upon return.
 */
public interface RegisterDamageReportUseCase {

    DamageReport registerDamageReport(RegisterDamageReportCommand command);

    record RegisterDamageReportCommand(
            Long returnId,
            String reportedBy,
            DamageType damageType,
            String description,
            Money repairCostEstimate
    ) {}
}
