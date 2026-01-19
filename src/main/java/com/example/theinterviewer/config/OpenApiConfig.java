package com.example.theinterviewer.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(info = @Info(title = "TheInterviewer API", version = "1.0", description = "Production-ready REST API for TheInterviewer - AI Powered Mock Interview Platform", contact = @Contact(name = "Support Team", email = "help@theinterviewer.site", url = "https://theinterviewer.site"), license = @License(name = "Proprietary", url = "https://theinterviewer.site/terms")), security = {
                @SecurityRequirement(name = "bearerAuth")
})
@SecurityScheme(name = "bearerAuth", description = "JWT Authentication - Enter your token", scheme = "bearer", type = SecuritySchemeType.HTTP, bearerFormat = "JWT", in = SecuritySchemeIn.HEADER)
public class OpenApiConfig {
}
