package kyung.admin_backend.domain.controller;

import kyung.admin_backend.domain.dto.AdminBookingPaymentDto;
import kyung.admin_backend.domain.dto.AdminUserDto;
import kyung.admin_backend.domain.service.AdminBookingPaymentService;
import kyung.kung_backend.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminBookingPaymentController {

    private final AdminBookingPaymentService adminBookingPaymentService;

    @GetMapping("/bookings")
    public ApiResponse<List<AdminBookingPaymentDto.BookingResponse>> getBookings() {
        return ApiResponse.onSuccess(adminBookingPaymentService.getBookings());
    }

    @GetMapping("/payments")
    public ApiResponse<List<AdminBookingPaymentDto.PaymentResponse>> getPayments() {
        return ApiResponse.onSuccess(adminBookingPaymentService.getPayments());
    }

    @PostMapping("/payments/{paymentId}/refund")
    public ApiResponse<Void> refundPayment(
            @PathVariable Long paymentId,
            @RequestBody AdminUserDto.SuspendRequest request
    ) {
        adminBookingPaymentService.refundPayment(paymentId, request.getReason());
        return ApiResponse.onSuccess((Void) null);
    }
}
