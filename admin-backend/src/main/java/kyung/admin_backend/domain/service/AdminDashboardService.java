package kyung.admin_backend.domain.service;

import jakarta.persistence.EntityManager;
import kyung.admin_backend.domain.dto.AdminDashboardDto;
import kyung.kung_backend.domain.user.entity.User;
import kyung.kung_backend.domain.payment.entity.Payment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AdminDashboardService {

    private final EntityManager em;

    public AdminDashboardDto.SummaryResponse getDashboardSummary() {
        // 1. Total Users
        long totalUsers = em.createQuery("select count(u) from User u", Long.class).getSingleResult();

        // 2. Expert Users
        long expertUsers = em.createQuery("select count(u) from User u where u.role = 'EXPERT'", Long.class).getSingleResult();

        // 3. Total Sales (PAID status payments)
        BigDecimal totalSales = em.createQuery("select sum(p.paymentAmount) from Payment p where p.paymentStatus = 'PAID'", BigDecimal.class)
                .getSingleResult();
        if (totalSales == null) totalSales = BigDecimal.ZERO;

        // 4. Active Bookings
        long activeBookings = em.createQuery("select count(b) from Booking b where b.status = 'CONFIRMED'", Long.class).getSingleResult();

        // 5. Total Community Posts
        long totalCommunityPosts = em.createQuery("select count(p) from CommunityPost p where p.status != 'DELETED'", Long.class).getSingleResult();

        // 6. Total Notices
        long totalNotices = em.createQuery("select count(n) from Notice n where n.status != 'DELETED'", Long.class).getSingleResult();

        // 7. Recent Users (Top 5)
        List<User> usersList = em.createQuery("select u from User u order by u.createdAt desc", User.class)
                .setMaxResults(5)
                .getResultList();
        List<AdminDashboardDto.RecentUser> recentUsers = new ArrayList<>();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        for (User u : usersList) {
            recentUsers.add(AdminDashboardDto.RecentUser.builder()
                    .userId(u.getUserId())
                    .name(u.getName())
                    .email(u.getEmail())
                    .role(u.getRole())
                    .status(u.getStatus())
                    .createdAt(u.getCreatedAt() != null ? u.getCreatedAt().format(dtf) : "")
                    .build());
        }

        // 8. Recent Payments (Top 5)
        List<Payment> paymentsList = em.createQuery("select p from Payment p join fetch p.user u order by p.createdAt desc", Payment.class)
                .setMaxResults(5)
                .getResultList();
        List<AdminDashboardDto.RecentPayment> recentPayments = new ArrayList<>();
        for (Payment p : paymentsList) {
            recentPayments.add(AdminDashboardDto.RecentPayment.builder()
                    .paymentId(p.getPaymentId())
                    .orderId(p.getOrderId())
                    .userName(p.getUser().getName())
                    .paymentMethod(p.getPaymentMethod())
                    .paymentAmount(p.getPaymentAmount())
                    .paymentStatus(p.getPaymentStatus())
                    .paidAt(p.getPaidAt() != null ? p.getPaidAt().format(dtf) : "")
                    .build());
        }

        // 9. Sales & Bookings Trend (Last 7 Days)
        List<AdminDashboardDto.SalesTrend> trend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.atTime(23, 59, 59);

            BigDecimal daySales = em.createQuery("select sum(p.paymentAmount) from Payment p where p.paymentStatus = 'PAID' and p.paidAt >= :start and p.paidAt <= :end", BigDecimal.class)
                    .setParameter("start", start)
                    .setParameter("end", end)
                    .getSingleResult();
            if (daySales == null) daySales = BigDecimal.ZERO;

            long dayBookings = em.createQuery("select count(b) from Booking b where b.status = 'CONFIRMED' and b.createdAt >= :start and b.createdAt <= :end", Long.class)
                    .setParameter("start", start)
                    .setParameter("end", end)
                    .getSingleResult();

            trend.add(AdminDashboardDto.SalesTrend.builder()
                    .date(date.format(DateTimeFormatter.ofPattern("MM/dd")))
                    .sales(daySales)
                    .bookings(dayBookings)
                    .build());
        }

        return AdminDashboardDto.SummaryResponse.builder()
                .totalUsers(totalUsers)
                .expertUsers(expertUsers)
                .totalSales(totalSales)
                .activeBookings(activeBookings)
                .totalCommunityPosts(totalCommunityPosts)
                .totalNotices(totalNotices)
                .recentUsers(recentUsers)
                .recentPayments(recentPayments)
                .salesTrend(trend)
                .build();
    }
}
