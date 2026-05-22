package kyung.admin_backend.domain.auth.controller;

import kyung.admin_backend.domain.dto.AdminAuthDto;
import kyung.admin_backend.global.security.JwtProvider;
import kyung.kung_backend.domain.user.entity.User;
import kyung.kung_backend.domain.user.repository.UserRepository;
import kyung.kung_backend.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    @PostMapping("/login")
    public ApiResponse<?> login(@RequestBody AdminAuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            return ApiResponse.onFailure("AUTH_ERR", "존재하지 않는 이메일입니다.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ApiResponse.onFailure("AUTH_ERR", "비밀번호가 일치하지 않습니다.");
        }

        if (!"ADMIN".equals(user.getRole())) {
            return ApiResponse.onFailure("AUTH_ERR", "관리자 권한이 없습니다.");
        }

        if (!"ACTIVE".equals(user.getStatus())) {
            return ApiResponse.onFailure("AUTH_ERR", "정지되었거나 활성화되지 않은 계정입니다.");
        }

        String accessToken = jwtProvider.createAccessToken(user);
        String refreshToken = jwtProvider.createRefreshToken(user);

        // Update refreshToken in DB if needed (optional)

        AdminAuthDto.LoginResponse response = AdminAuthDto.LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getUserId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .build();

        return ApiResponse.onSuccess(response);
    }
}
