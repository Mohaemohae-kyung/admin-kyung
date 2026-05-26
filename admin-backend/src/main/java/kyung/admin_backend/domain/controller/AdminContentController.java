package kyung.admin_backend.domain.controller;

import kyung.admin_backend.domain.dto.AdminContentDto;
import kyung.admin_backend.domain.service.AdminContentService;
import kyung.kung_backend.domain.user.entity.User;
import kyung.kung_backend.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminContentController {

    private final AdminContentService adminContentService;

    // --- Notices ---
    @GetMapping("/notices")
    public ApiResponse<List<AdminContentDto.NoticeResponse>> getNotices() {
        return ApiResponse.onSuccess(adminContentService.getNotices());
    }

    @PostMapping("/notices")
    public ApiResponse<Void> createNotice(
            @AuthenticationPrincipal User admin,
            @RequestBody AdminContentDto.NoticeRequest request
    ) {
        adminContentService.createNotice(admin, request);
        return ApiResponse.onSuccess((Void) null);
    }

    @PatchMapping("/notices/{noticeId}")
    public ApiResponse<Void> updateNotice(
            @PathVariable Long noticeId,
            @RequestBody AdminContentDto.NoticeRequest request
    ) {
        adminContentService.updateNotice(noticeId, request);
        return ApiResponse.onSuccess((Void) null);
    }

    @DeleteMapping("/notices/{noticeId}")
    public ApiResponse<Void> deleteNotice(@PathVariable Long noticeId) {
        adminContentService.deleteNotice(noticeId);
        return ApiResponse.onSuccess((Void) null);
    }

    // --- Community ---
    @GetMapping("/community/posts")
    public ApiResponse<List<AdminContentDto.CommunityPostResponse>> getCommunityPosts() {
        return ApiResponse.onSuccess(adminContentService.getCommunityPosts());
    }

    @DeleteMapping("/community/posts/{postId}")
    public ApiResponse<Void> deleteCommunityPost(@PathVariable Long postId) {
        adminContentService.deleteCommunityPost(postId);
        return ApiResponse.onSuccess((Void) null);
    }

    @DeleteMapping("/community/comments/{commentId}")
    public ApiResponse<Void> deleteCommunityComment(@PathVariable Long commentId) {
        adminContentService.deleteCommunityComment(commentId);
        return ApiResponse.onSuccess((Void) null);
    }
}
