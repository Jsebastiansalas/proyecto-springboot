package com.renta.domain.port.out;

import com.renta.domain.model.entity.DamageReport;

import java.util.List;
import java.util.Optional;

/**
 * Outbound repository port for {@link DamageReport} persistence.
 */
public interface DamageReportRepositoryPort {

    DamageReport save(DamageReport report);

    Optional<DamageReport> findById(Long id);

    List<DamageReport> findByReturnId(Long returnId);
}
