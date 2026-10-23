package com.renta.infrastructure.adapter.out.persistence;

import com.renta.domain.model.entity.ReservationStatusAuditLog;
import com.renta.domain.model.enums.ReservationStatus;
import com.renta.domain.port.out.ReservationAuditLogRepositoryPort;
import com.renta.infrastructure.adapter.out.persistence.entity.ReservationStatusAuditLogJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataReservationAuditLogRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ReservationAuditLogRepositoryAdapter implements ReservationAuditLogRepositoryPort {

    private final SpringDataReservationAuditLogRepository repository;

    public ReservationAuditLogRepositoryAdapter(SpringDataReservationAuditLogRepository repository) {
        this.repository = repository;
    }

    @Override
    public ReservationStatusAuditLog save(ReservationStatusAuditLog auditLog) {
        ReservationStatusAuditLogJpaEntity entity = toEntity(auditLog);
        ReservationStatusAuditLogJpaEntity saved = repository.save(entity);
        return toDomain(saved);
    }

    @Override
    public List<ReservationStatusAuditLog> findByReservationIdOrderByChangedAtDesc(Long reservationId) {
        return repository.findByReservationIdOrderByChangedAtDesc(reservationId)
                .stream()
                .map(this::toDomain)
                .toList();
    }

    private ReservationStatusAuditLogJpaEntity toEntity(ReservationStatusAuditLog domain) {
        return new ReservationStatusAuditLogJpaEntity(
                domain.getId(),
                domain.getReservationId(),
                domain.getPreviousStatus() != null ? domain.getPreviousStatus().name() : null,
                domain.getNewStatus() != null ? domain.getNewStatus().name() : null,
                domain.getChangedBy(),
                domain.getChangedAt(),
                domain.getReason()
        );
    }

    private ReservationStatusAuditLog toDomain(ReservationStatusAuditLogJpaEntity entity) {
        ReservationStatus prevStatus = null;
        if (entity.getPreviousStatus() != null) {
            try {
                prevStatus = ReservationStatus.valueOf(entity.getPreviousStatus());
            } catch (IllegalArgumentException ignored) {
            }
        }
        ReservationStatus newStatus = null;
        if (entity.getNewStatus() != null) {
            try {
                newStatus = ReservationStatus.valueOf(entity.getNewStatus());
            } catch (IllegalArgumentException ignored) {
            }
        }
        return new ReservationStatusAuditLog(
                entity.getId(),
                entity.getReservationId(),
                prevStatus,
                newStatus,
                entity.getChangedBy(),
                entity.getChangedAt(),
                entity.getReason()
        );
    }
}
