package kyung.admin_backend.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

public class AdminUserDto {

    @Getter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ListResponse {
        private Long userId;
        private String email;
        private String name;
        private String nickname;
        private String role;
        private String status;
        private String createdAt;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DetailResponse {
        private Long userId;
        private String email;
        private String name;
        private String nickname;
        private String phone;
        private String role;
        private String status;
        private String createdAt;
        private String lastLoginAt;
        private String profileImageUrl;
        private List<ActionLog> actionLogs;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ActionLog {
        private Long adminActionId;
        private String adminEmail;
        private String actionType;
        private String reason;
        private String createdAt;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SuspendRequest {
        private String reason;
    }
}
