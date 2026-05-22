package kyung.admin_backend.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

public class AdminBookingPaymentDto {

    @Getter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BookingResponse {
        private Long bookingId;
        private String userEmail;
        private String userName;
        private String storeProductTitle;
        private String startAt;
        private String endAt;
        private String locationText;
        private String status;
        private String createdAt;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PaymentResponse {
        private Long paymentId;
        private String orderId;
        private String userEmail;
        private String userName;
        private String paymentMethod;
        private BigDecimal paymentAmount;
        private String paymentStatus;
        private String paidAt;
        private String cancelledAt;
        private String failedReason;
        private String createdAt;
    }
}
