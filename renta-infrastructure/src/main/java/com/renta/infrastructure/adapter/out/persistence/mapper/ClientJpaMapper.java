package com.renta.infrastructure.adapter.out.persistence.mapper;

import com.renta.domain.model.entity.Client;
import com.renta.domain.model.enums.DocumentType;
import com.renta.infrastructure.adapter.out.persistence.entity.ClientJpaEntity;

public final class ClientJpaMapper {

    private ClientJpaMapper() {}

    public static Client toDomain(ClientJpaEntity entity) {
        if (entity == null) return null;
        DocumentType docType;
        try {
            docType = DocumentType.valueOf(entity.getDocumentType());
        } catch (Exception e) {
            docType = DocumentType.CC;
        }

        return new Client(
                entity.getId(),
                entity.getUserId(),
                entity.getFirstName(),
                entity.getLastName(),
                docType,
                entity.getDocumentNumber(),
                entity.getPhone(),
                entity.getAddress(),
                entity.getCity(),
                entity.getCreatedAt()
        );
    }

    public static ClientJpaEntity toJpa(Client domain) {
        if (domain == null) return null;
        return new ClientJpaEntity(
                domain.getId(),
                domain.getUserId(),
                domain.getFirstName(),
                domain.getLastName(),
                domain.getDocumentType() != null ? domain.getDocumentType().name() : "CC",
                domain.getDocumentNumber(),
                domain.getPhone(),
                domain.getAddress(),
                domain.getCity(),
                domain.getCreatedAt()
        );
    }
}
