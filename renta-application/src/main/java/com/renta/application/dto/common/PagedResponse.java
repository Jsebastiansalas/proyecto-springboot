package com.renta.application.dto.common;

import java.util.List;

/**
 * DTO Genérico inmutable para respuestas paginadas (Puro Java, sin acoplamiento a frameworks).
 */
public record PagedResponse<T>(
        List<T> content,
        int pageNumber,
        int pageSize,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last,
        boolean empty
) {
}
