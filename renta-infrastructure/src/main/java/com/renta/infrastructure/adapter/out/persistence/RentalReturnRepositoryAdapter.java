package com.renta.infrastructure.adapter.out.persistence;

import com.renta.domain.model.entity.RentalReturn;
import com.renta.domain.port.out.RentalReturnRepositoryPort;
import com.renta.infrastructure.adapter.out.persistence.entity.RentalReturnJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.mapper.RentalReturnJpaMapper;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataRentalReturnRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class RentalReturnRepositoryAdapter implements RentalReturnRepositoryPort {

    private final SpringDataRentalReturnRepository repository;

    public RentalReturnRepositoryAdapter(SpringDataRentalReturnRepository repository) {
        this.repository = repository;
    }

    @Override
    public RentalReturn save(RentalReturn rentalReturn) {
        RentalReturnJpaEntity entity = RentalReturnJpaMapper.toJpa(rentalReturn);
        RentalReturnJpaEntity saved = repository.save(entity);
        return RentalReturnJpaMapper.toDomain(saved);
    }

    @Override
    public Optional<RentalReturn> findById(Long id) {
        return repository.findById(id).map(RentalReturnJpaMapper::toDomain);
    }

    @Override
    public Optional<RentalReturn> findByReservationId(Long reservationId) {
        return repository.findByReservationId(reservationId).map(RentalReturnJpaMapper::toDomain);
    }
}
