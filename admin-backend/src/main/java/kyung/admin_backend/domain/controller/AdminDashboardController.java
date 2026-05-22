package kyung.admin_backend.domain.controller;

import kyung.admin_backend.domain.dto.AdminDashboardDto;
import kyung.admin_backend.domain.service.AdminDashboardService;
import kyung.kung_backend.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping
    public ApiResponse<AdminDashboardDto.SummaryResponse> getDashboardSummary() {
        return ApiResponse.onSuccess(adminDashboardService.getDashboardSummary());
    }
}
