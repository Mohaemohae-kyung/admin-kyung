package kyung.admin_backend.global.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    private static final String JWT_SCHEME_NAME = "BearerToken";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(apiInfo())
                .addSecurityItem(securityRequirement())
                .components(components())
                .servers(List.of(adminProdServer(), adminLocalServer()));
    }

    private Info apiInfo() {
        return new Info()
                .title("Kung Admin Backend API")
                .description("Kyung 관리자 서비스 API Documentation")
                .version("v1.0.0");
    }

    private SecurityRequirement securityRequirement() {
        return new SecurityRequirement()
                .addList(JWT_SCHEME_NAME);
    }

    private Components components() {
        return new Components()
                .addSecuritySchemes(JWT_SCHEME_NAME, jwtSecurityScheme());
    }

    private SecurityScheme jwtSecurityScheme() {
        return new SecurityScheme()
                .name(JWT_SCHEME_NAME)
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("관리자 JWT Access Token을 입력합니다. 예: Bearer 없이 토큰 값만 입력");
    }

    private Server adminProdServer() {
        return new Server()
                .url("http://43.200.59.30")
                .description("Admin Production Server");
    }

    private Server adminLocalServer() {
        return new Server()
                .url("http://localhost:8081")
                .description("Admin Local Server");
    }

    @Bean
    public GroupedOpenApi adminApiGroup() {
        return GroupedOpenApi.builder()
                .group("Admin APIs")
                .pathsToMatch("/api/admin/**")
                .build();
    }

    @Bean
    public GroupedOpenApi allApiGroup() {
        return GroupedOpenApi.builder()
                .group("All APIs")
                .pathsToMatch("/**")
                .build();
    }
}