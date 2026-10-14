package com.renta.application.port.in;

import com.renta.application.dto.report.AdminDashboardResponse;
import com.renta.application.dto.report.ProviderDashboardResponse;

public interface ReportUseCase {

    AdminDashboardResponse getAdminDashboard();

    ProviderDashboardResponse getProviderDashboard(Long providerId);
}
