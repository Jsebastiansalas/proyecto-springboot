package com.renta.application.port.in;

import com.renta.application.dto.auth.LoginRequest;
import com.renta.application.dto.auth.LoginResponse;
import com.renta.application.dto.auth.RegisterClientRequest;
import com.renta.application.dto.auth.RegisterProviderRequest;
import com.renta.application.dto.auth.UserSummaryDto;

import java.util.List;

public interface AuthUseCase {

    LoginResponse login(LoginRequest request);

    LoginResponse registerClient(RegisterClientRequest request);

    LoginResponse registerProvider(RegisterProviderRequest request);

    UserSummaryDto getCurrentUser(Long userId);

    List<UserSummaryDto> listAllUsers();

    void toggleUserStatus(Long userId, boolean active);
}
