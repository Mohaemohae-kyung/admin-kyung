package kyung.admin_backend.domain.controller;

import kyung.admin_backend.domain.dto.AdminUserDto;
import kyung.admin_backend.domain.service.AdminUserManagementService;
import kyung.kung_backend.domain.user.entity.User;
import kyung.kung_backend.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserManagementController {

    private final AdminUserManagementService adminUserManagementService;

    @GetMapping
    public ApiResponse<List<AdminUserDto.ListResponse>> getUsers(@RequestParam(required = false) String query) {
        return ApiResponse.onSuccess(adminUserManagementService.getUsers(query));
    }

    @GetMapping("/{userId}")
    public ApiResponse<AdminUserDto.DetailResponse> getUserDetail(@PathVariable Long userId) {
        return ApiResponse.onSuccess(adminUserManagementService.getUserDetail(userId));
    }

    @PostMapping("/{userId}/suspend")
    public ApiResponse<Void> suspendUser(
            @AuthenticationPrincipal User admin,
            @PathVariable Long userId,
            @RequestBody AdminUserDto.SuspendRequest request
    ) {
        adminUserManagementService.suspendUser(admin, userId, request.getReason());
        return ApiResponse.onSuccess(null);
    }

    @PostMapping("/{userId}/unsuspend")
    public ApiResponse<Void> unsuspendUser(
            @AuthenticationPrincipal User admin,
            @PathVariable Long userId,
            @RequestBody AdminUserDto.SuspendRequest request
    ) {
        adminUserManagementService.unsuspendUser(admin, userId, request.getReason());
        return ApiResponse.onSuccess(null);
    }
}
