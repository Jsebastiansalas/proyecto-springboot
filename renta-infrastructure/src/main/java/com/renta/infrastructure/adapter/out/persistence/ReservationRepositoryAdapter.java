package com.renta.infrastructure.adapter.out.persistence;

import com.renta.domain.model.entity.Reservation;
import com.renta.domain.model.enums.ReservationStatus;
import com.renta.domain.model.vo.DateRange;
import com.renta.domain.port.out.ReservationRepositoryPort;
import com.renta.infrastructure.adapter.out.persistence.entity.ReservationJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.mapper.ReservationJpaMapper;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataReservationRepository;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Component
public class ReservationRepositoryAdapter implements ReservationRepositoryPort {

    private final SpringDataReservationRepository repository;

    public ReservationRepositoryAdapter(SpringDataReservationRepository repository) {
        this.repository = repository;
    }

    @Override
    public Reservation save(Reservation reservation) {
        ReservationJpaEntity entity = ReservationJpaMapper.toJpa(reservation);
        ReservationJpaEntity saved = repository.save(entity);
        return ReservationJpaMapper.toDomain(saved);
    }

    @Override
    public Optional<Reservation> findById(Long id) {
        return repository.findById(id).map(ReservationJpaMapper::toDomain);
    }

    @Override
    public Optional<Reservation> findByReservationCode(String code) {
        return repository.findByReservationCode(code).map(ReservationJpaMapper::toDomain);
    }

    @Override
    public List<Reservation> findByClientId(Long clientId) {
        return repository.findByClientId(clientId).stream()
                .map(ReservationJpaMapper::toDomain)
                .toList();
    }

    @Override
    public List<Reservation> findByToolId(Long toolId) {
        return repository.findByToolId(toolId).stream()
                .map(ReservationJpaMapper::toDomain)
                .toList();
    }

    @Override
    public List<Reservation> findOverlappingReservations(Long toolId, DateRange dateRange, List<ReservationStatus> activeStatuses) {
        if (dateRange == null) return List.of();
        Collection<String> statusNames = activeStatuses != null
                ? activeStatuses.stream().map(Enum::name).toList()
                : List.of("PENDIENTE", "APROBADA", "EN_CURSO");

        return repository.findOverlapping(toolId, dateRange.startDate(), dateRange.endDate(), statusNames).stream()
                .map(ReservationJpaMapper::toDomain)
                .toList();
    }

    @Override
    public boolean existsOverlapping(Long toolId, DateRange dateRange) {
        if (dateRange == null) return false;
        return repository.existsOverlapping(toolId, dateRange.startDate(), dateRange.endDate());
    }
}
