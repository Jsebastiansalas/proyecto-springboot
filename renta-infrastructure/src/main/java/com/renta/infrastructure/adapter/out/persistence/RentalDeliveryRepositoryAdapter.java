package com.renta.infrastructure.adapter.out.persistence;

import com.renta.domain.model.entity.RentalDelivery;
import com.renta.domain.port.out.RentalDeliveryRepositoryPort;
import com.renta.infrastructure.adapter.out.persistence.entity.RentalDeliveryJpaEntity;
import com.renta.infrastructure.adapter.out.persistence.mapper.RentalDeliveryJpaMapper;
import com.renta.infrastructure.adapter.out.persistence.repository.SpringDataRentalDeliveryRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class RentalDeliveryRepositoryAdapter implements RentalDeliveryRepositoryPort {

    private final SpringDataRentalDeliveryRepository repository;

    public RentalDeliveryRepositoryAdapter(SpringDataRentalDeliveryRepository repository) {
        this.repository = repository;
    }

    @Override
    public RentalDelivery save(RentalDelivery delivery) {
        RentalDeliveryJpaEntity entity = RentalDeliveryJpaMapper.toJpa(delivery);
        RentalDeliveryJpaEntity saved = repository.save(entity);
        return RentalDeliveryJpaMapper.toDomain(saved);
    }

    @Override
    public Optional<RentalDelivery> findById(Long id) {
        return repository.findById(id).map(RentalDeliveryJpaMapper::toDomain);
    }

    @Override
    public Optional<RentalDelivery> findByReservationId(Long reservationId) {
        return repository.findByReservationId(reservationId).map(RentalDeliveryJpaMapper::toDomain);
    }
}
