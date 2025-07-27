// package com.tahsin.backend.Configuration;

// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.web.servlet.config.annotation.CorsRegistry;
// import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// @Configuration
// public class WebConfig {
//     @Value("${FRONTEND_URL}")
//     private String frontendUrl;
//     @Bean public WebMvcConfigurer corsConfigurer() {
//         return new WebMvcConfigurer() {
//             public void addCorsMappings(CorsRegistry registry){
//                 registry.addMapping("/**")
//                         .allowedOrigins(frontendUrl)
//                         .allowedMethods("GET","POST","PUT","DELETE","OPTIONS","PATCH")
//                         .allowedHeaders("*")
//                         .allowCredentials(true)
//                         .exposedHeaders("Authorization", "Content-Type", "X-Requested-With");
//             }
//         };
//     }

// }
package com.tahsin.backend.Configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {
    @Value("${FRONTEND_URL}")
    private String frontendUrl;
    @Bean public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            public void addCorsMappings(CorsRegistry registry){
                registry.addMapping("/**")
                        .allowedOrigins(frontendUrl)
                        .allowedMethods("GET","POST","PUT","DELETE","OPTIONS","PATCH")
                        .allowedHeaders("*")
                        .allowCredentials(true)
                        .exposedHeaders("Authorization", "Content-Type", "X-Requested-With");
            }
        };
    }

}
