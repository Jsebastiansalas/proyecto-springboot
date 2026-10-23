package com.renta.application.dto.reservation;

import jakarta.validation.constraints.Size;

public record CancelWithPenaltyRequest(
        @Size(max = 255, message = "El motivo no puede superar 255 caracteres")
        String reason
) {
}
