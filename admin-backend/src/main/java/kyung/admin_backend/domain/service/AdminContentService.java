package kyung.admin_backend.domain.service;

import jakarta.persistence.EntityManager;
import kyung.admin_backend.domain.dto.AdminContentDto;
import kyung.kung_backend.domain.community.entity.CommunityComment;
import kyung.kung_backend.domain.community.entity.CommunityPost;
import kyung.kung_backend.domain.notice.entity.Notice;
import kyung.kung_backend.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminContentService {

    private final EntityManager em;

    // --- Notices ---
    public List<AdminContentDto.NoticeResponse> getNotices() {
        List<Notice> notices = em.createQuery(
                "select n from Notice n join fetch n.admin where n.status != 'DELETED' order by n.createdAt desc", Notice.class)
                .getResultList();

        List<AdminContentDto.NoticeResponse> list = new ArrayList<>();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (Notice n : notices) {
            list.add(AdminContentDto.NoticeResponse.builder()
                    .noticeId(n.getNoticeId())
                    .adminEmail(n.getAdmin().getEmail())
                    .adminName(n.getAdmin().getName())
                    .noticeType(n.getNoticeType())
                    .title(n.getTitle())
                    .content(n.getContent())
                    .viewCount(n.getViewCount())
                    .status(n.getStatus())
                    .createdAt(n.getCreatedAt() != null ? n.getCreatedAt().format(dtf) : "")
                    .build());
        }
        return list;
    }

    @Transactional
    public void createNotice(User admin, AdminContentDto.NoticeRequest request) {
        Notice notice = Notice.createNotice(admin, request.getNoticeType(), request.getTitle(), request.getContent());
        em.persist(notice);
    }

    @Transactional
    public void updateNotice(Long noticeId, AdminContentDto.NoticeRequest request) {
        Notice notice = em.find(Notice.class, noticeId);
        if (notice == null) {
            throw new IllegalArgumentException("존재하지 않는 공지사항입니다.");
        }
        notice.updateNotice(request.getTitle(), request.getContent());
    }

    @Transactional
    public void deleteNotice(Long noticeId) {
        Notice notice = em.find(Notice.class, noticeId);
        if (notice == null) {
            throw new IllegalArgumentException("존재하지 않는 공지사항입니다.");
        }
        notice.updateStatus("DELETED");
        // Update deleted_at
        em.createQuery("update Notice n set n.deletedAt = :now where n.noticeId = :id")
                .setParameter("now", LocalDateTime.now())
                .setParameter("id", noticeId)
                .executeUpdate();
    }

    // --- Community ---
    public List<AdminContentDto.CommunityPostResponse> getCommunityPosts() {
        List<CommunityPost> posts = em.createQuery(
                "select p from CommunityPost p join fetch p.user where p.status != 'DELETED' order by p.createdAt desc", CommunityPost.class)
                .getResultList();

        List<AdminContentDto.CommunityPostResponse> list = new ArrayList<>();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (CommunityPost p : posts) {
            list.add(AdminContentDto.CommunityPostResponse.builder()
                    .communityPostId(p.getCommunityPostId())
                    .userEmail(p.getUser().getEmail())
                    .userName(p.getUser().getName())
                    .boardType(p.getBoardType())
                    .title(p.getTitle())
                    .content(p.getContent())
                    .viewCount(p.getViewCount())
                    .status(p.getStatus())
                    .createdAt(p.getCreatedAt() != null ? p.getCreatedAt().format(dtf) : "")
                    .build());
        }
        return list;
    }

    @Transactional
    public void deleteCommunityPost(Long postId) {
        CommunityPost post = em.find(CommunityPost.class, postId);
        if (post == null) {
            throw new IllegalArgumentException("존재하지 않는 게시글입니다.");
        }
        post.softDelete();
    }

    @Transactional
    public void deleteCommunityComment(Long commentId) {
        CommunityComment comment = em.find(CommunityComment.class, commentId);
        if (comment == null) {
            throw new IllegalArgumentException("존재하지 않는 댓글입니다.");
        }
        em.remove(comment);
    }
}
