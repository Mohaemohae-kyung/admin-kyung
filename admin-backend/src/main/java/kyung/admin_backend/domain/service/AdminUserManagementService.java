package kyung.admin_backend.domain.service;

import jakarta.persistence.EntityManager;
import kyung.admin_backend.domain.dto.AdminUserDto;
import kyung.kung_backend.domain.admin.entity.AdminAction;
import kyung.kung_backend.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminUserManagementService {

    private final EntityManager em;

    public List<AdminUserDto.ListResponse> getUsers(String query) {
        String jpql = "select u from User u";
        if (query != null && !query.trim().isEmpty()) {
            jpql += " where lower(u.name) like :query or lower(u.email) like :query or lower(u.nickname) like :query";
        }
        jpql += " order by u.createdAt desc";

        var typedQuery = em.createQuery(jpql, User.class);
        if (query != null && !query.trim().isEmpty()) {
            typedQuery.setParameter("query", "%" + query.trim().toLowerCase() + "%");
        }

        List<User> list = typedQuery.getResultList();
        List<AdminUserDto.ListResponse> dtoList = new ArrayList<>();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (User u : list) {
            dtoList.add(AdminUserDto.ListResponse.builder()
                    .userId(u.getUserId())
                    .email(u.getEmail())
                    .name(u.getName())
                    .nickname(u.getNickname())
                    .role(u.getRole())
                    .status(u.getStatus())
                    .createdAt(u.getCreatedAt() != null ? u.getCreatedAt().format(dtf) : "")
                    .build());
        }

        return dtoList;
    }

    public AdminUserDto.DetailResponse getUserDetail(Long userId) {
        User u = em.find(User.class, userId);
        if (u == null) {
            throw new IllegalArgumentException("존재하지 않는 회원입니다.");
        }

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        // Fetch admin action logs for this target
        List<AdminAction> logs = em.createQuery(
                "select a from AdminAction a join fetch a.admin where a.targetType = 'USER' and a.targetId = :targetId order by a.createdAt desc", AdminAction.class)
                .setParameter("targetId", userId)
                .getResultList();

        List<AdminUserDto.ActionLog> actionLogs = new ArrayList<>();
        for (AdminAction a : logs) {
            actionLogs.add(AdminUserDto.ActionLog.builder()
                    .adminActionId(a.getAdminActionId())
                    .adminEmail(a.getAdmin().getEmail())
                    .actionType(a.getActionType())
                    .reason(a.getReason())
                    .createdAt(a.getCreatedAt() != null ? a.getCreatedAt().format(dtf) : "")
                    .build());
        }

        return AdminUserDto.DetailResponse.builder()
                .userId(u.getUserId())
                .email(u.getEmail())
                .name(u.getName())
                .nickname(u.getNickname())
                .phone(u.getPhone())
                .role(u.getRole())
                .status(u.getStatus())
                .createdAt(u.getCreatedAt() != null ? u.getCreatedAt().format(dtf) : "")
                .lastLoginAt(u.getLastLoginAt() != null ? u.getLastLoginAt().format(dtf) : "")
                .profileImageUrl(u.getProfileImageUrl())
                .actionLogs(actionLogs)
                .build();
    }

    @Transactional
    public void suspendUser(User admin, Long userId, String reason) {
        User u = em.find(User.class, userId);
        if (u == null) {
            throw new IllegalArgumentException("존재하지 않는 회원입니다.");
        }

        u.suspend(); // Set status = 'SUSPENDED'

        User managedAdmin = em.find(User.class, admin.getUserId());
        AdminAction log = AdminAction.create(managedAdmin, "USER", userId, "SUSPEND", reason);
        em.persist(log);
    }

    @Transactional
    public void unsuspendUser(User admin, Long userId, String reason) {
        User u = em.find(User.class, userId);
        if (u == null) {
            throw new IllegalArgumentException("존재하지 않는 회원입니다.");
        }

        // Return user to active status
        em.createQuery("update User u set u.status = 'ACTIVE' where u.userId = :userId")
                .setParameter("userId", userId)
                .executeUpdate();

        User managedAdmin = em.find(User.class, admin.getUserId());
        AdminAction log = AdminAction.create(managedAdmin, "USER", userId, "UNSUSPEND", reason);
        em.persist(log);
    }
}
