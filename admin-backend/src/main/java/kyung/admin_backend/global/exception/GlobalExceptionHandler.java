package kyung.admin_backend.global.exception;

import kyung.kung_backend.global.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        e.printStackTrace();
        return ResponseEntity
                .status(HttpStatus.OK) // 200 OK to prevent frontend fetch error/403 dispatch
                .body(ApiResponse.onFailure("ERROR", e.getMessage() != null ? e.getMessage() : "서버 오류가 발생했습니다."));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgumentException(IllegalArgumentException e) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.onFailure("BAD_REQUEST", e.getMessage()));
    }
}
