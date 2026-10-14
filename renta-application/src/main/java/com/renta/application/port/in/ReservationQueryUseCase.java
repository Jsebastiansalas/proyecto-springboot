package com.renta.application.port.in;

import com.renta.application.dto.reservation.ReservationResponse;

import java.util.List;

public interface ReservationQueryUseCase {

    ReservationResponse getReservationById(Long id);

    ReservationResponse getReservationByCode(String code);

    List<ReservationResponse> listReservationsByClient(Long clientId);

    List<ReservationResponse> listReservationsByProvider(Long providerId);

    List<ReservationResponse> listReservationsByTool(Long toolId);

    List<ReservationResponse> listAllReservations();
}
