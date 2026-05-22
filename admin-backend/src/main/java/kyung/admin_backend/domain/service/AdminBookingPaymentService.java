package kyung.admin_backend.domain.service;

import jakarta.persistence.EntityManager;
import kyung.admin_backend.domain.dto.AdminBookingPaymentDto;
import kyung.kung_backend.domain.booking.entity.Booking;
import kyung.kung_backend.domain.payment.entity.Payment;
import kyung.kung_backend.domain.transaction.entity.Transaction;
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
public class AdminBookingPaymentService {

    private final EntityManager em;

    public List<AdminBookingPaymentDto.BookingResponse> getBookings() {
        List<Booking> bookings = em.createQuery(
                "select b from Booking b join fetch b.user join fetch b.storeProduct order by b.createdAt desc", Booking.class)
                .getResultList();

        List<AdminBookingPaymentDto.BookingResponse> list = new ArrayList<>();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (Booking b : bookings) {
            list.add(AdminBookingPaymentDto.BookingResponse.builder()
                    .bookingId(b.getBookingId())
                    .userEmail(b.getUser().getEmail())
                    .userName(b.getUser().getName())
                    .storeProductTitle(b.getStoreProduct().getTitle())
                    .startAt(b.getStartAt() != null ? b.getStartAt().format(dtf) : "")
                    .endAt(b.getEndAt() != null ? b.getEndAt().format(dtf) : "")
                    .locationText(b.getLocationText())
                    .status(b.getStatus())
                    .createdAt(b.getCreatedAt() != null ? b.getCreatedAt().format(dtf) : "")
                    .build());
        }
        return list;
    }

    public List<AdminBookingPaymentDto.PaymentResponse> getPayments() {
        List<Payment> payments = em.createQuery(
                "select p from Payment p join fetch p.user order by p.createdAt desc", Payment.class)
                .getResultList();

        List<AdminBookingPaymentDto.PaymentResponse> list = new ArrayList<>();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (Payment p : payments) {
            list.add(AdminBookingPaymentDto.PaymentResponse.builder()
                    .paymentId(p.getPaymentId())
                    .orderId(p.getOrderId())
                    .userEmail(p.getUser().getEmail())
                    .userName(p.getUser().getName())
                    .paymentMethod(p.getPaymentMethod())
                    .paymentAmount(p.getPaymentAmount())
                    .paymentStatus(p.getPaymentStatus())
                    .paidAt(p.getPaidAt() != null ? p.getPaidAt().format(dtf) : "")
                    .cancelledAt(p.getCancelledAt() != null ? p.getCancelledAt().format(dtf) : "")
                    .failedReason(p.getFailedReason())
                    .createdAt(p.getCreatedAt() != null ? p.getCreatedAt().format(dtf) : "")
                    .build());
        }
        return list;
    }

    @Transactional
    public void refundPayment(Long paymentId, String reason) {
        Payment payment = em.find(Payment.class, paymentId);
        if (payment == null) {
            throw new IllegalArgumentException("존재하지 않는 결제 내역입니다.");
        }

        payment.refund(reason); // Set paymentStatus = 'REFUNDED'

        // Cancel associated booking if exists
        Transaction tx = payment.getTransaction();
        if (tx != null && "BOOKING".equals(tx.getTransactionType()) && tx.getBooking() != null) {
            Booking booking = tx.getBooking();
            booking.cancel(); // Set status = 'CANCELLED'
        }
    }
}
