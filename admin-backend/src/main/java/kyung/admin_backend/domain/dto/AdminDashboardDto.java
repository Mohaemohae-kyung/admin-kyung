package kyung.admin_backend.domain.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

public class AdminDashboardDto {

    @Getter
    @Builder
    public static class SummaryResponse {
        private long totalUsers;
        private long expertUsers;
        private BigDecimal totalSales;
        private long activeBookings;
        private long totalCommunityPosts;
        private long totalNotices;
        private List<SalesTrend> salesTrend;
        private List<RecentUser> recentUsers;
        private List<RecentPayment> recentPayments;
    }

    @Getter
    @Builder
    public static class SalesTrend {
        private String date;
        private BigDecimal sales;
        private long bookings;
    }

    @Getter
    @Builder
    public static class RecentUser {
        private Long userId;
        private String name;
        private String email;
        private String role;
        private String status;
        private String createdAt;
    }

    @Getter
    @Builder
    public static class RecentPayment {
        private Long paymentId;
        private String orderId;
        private String userName;
        private String paymentMethod;
        private BigDecimal paymentAmount;
        private String paymentStatus;
        private String paidAt;
    }
}
