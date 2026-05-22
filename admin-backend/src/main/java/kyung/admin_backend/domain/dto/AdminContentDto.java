package kyung.admin_backend.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class AdminContentDto {

    @Getter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class NoticeResponse {
        private Long noticeId;
        private String adminEmail;
        private String adminName;
        private String noticeType;
        private String title;
        private String content;
        private Long viewCount;
        private String status;
        private String createdAt;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NoticeRequest {
        private String noticeType;
        private String title;
        private String content;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CommunityPostResponse {
        private Long communityPostId;
        private String userEmail;
        private String userName;
        private String boardType;
        private String title;
        private String content;
        private Long viewCount;
        private String status;
        private String createdAt;
    }
}
