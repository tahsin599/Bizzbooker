package com.tahsin.backend.Configuration;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.tahsin.backend.Service.CustomOAuth2UserService;
import com.tahsin.backend.Service.JWTService;

import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

// @Configuration
// @EnableWebSecurity
// public class SecurityConfig {
//     @Bean
//     public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//         http
//             .csrf(csrf -> csrf.disable()) // Disable CSRF for now
//             .authorizeHttpRequests(auth -> auth
//                 .anyRequest().permitAll() // Allow all requests without authentication
//             );
        
//         return http.build();
//     }
// }


// @Configuration
// @EnableWebSecurity
// @EnableMethodSecurity
// public class SecurityConfig {
//     @Autowired
//     private UserDetailsService userDetailsService;

//     @Autowired
//     private JwtFilter jwtFilter;

//     @Value("${frontend.url}")
//     private String frontendUrl;
  
//     @Bean
//     @Order(0)
    

//     public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{

//         http.csrf(customizer->customizer.disable());
//         http.securityMatcher("/api/**").authorizeHttpRequests(request->request.requestMatchers("/api/register","/api/loging").permitAll().anyRequest().authenticated());
//         http.formLogin(Customizer.withDefaults());
//         http.httpBasic(Customizer.withDefaults());
//         http.sessionManagement(session->session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
//         http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

//         return http.build();

//     }

//     @Bean
//     @Order(1)
//     public SecurityFilterChain oauthsecurityFilterChain(HttpSecurity http) throws Exception {
//         http
//              // ONLY for /oauth/** endpoints
//             .csrf(csrf -> csrf.disable())
//             .authorizeHttpRequests(auth -> auth
//                 .requestMatchers("/oauth/error","/api/**").permitAll()
//                 .anyRequest().authenticated()
//             )
//             .oauth2Login(oauth2 -> oauth2
//                 .successHandler(customAuthenticationSuccessHandler())
//                 .defaultSuccessUrl("http://localhost:3000/dashboard", true)
//             );

//         return http.build();
//     }

//     @Bean
//     public AuthenticationSuccessHandler customAuthenticationSuccessHandler() {
//         return (request, response, authentication) -> {
//             response.sendRedirect("http://localhost:3000/dashboard");
//         };
//     }

   
//     @Bean
//     public AuthenticationProvider authenticationProvider(){
//         DaoAuthenticationProvider provider=new DaoAuthenticationProvider();
//         provider.setPasswordEncoder(new BCryptPasswordEncoder(12));
//        //provider.setPasswordEncoder(NoOpPasswordEncoder.getInstance());
//         provider.setUserDetailsService(userDetailsService);
//         return provider;
//     }

//     @Bean 
//     public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception{
//         return config.getAuthenticationManager();
        
//     }

// }


@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtFilter jwtFilter;

    @Autowired
    private JWTService jwtService;

    @Value("${frontend.url}")
    private String frontendUrl;
  
    @Bean
    @Order(0)
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource())).csrf(customizer -> customizer.disable());
        http.securityMatcher("/api/**")
           .authorizeHttpRequests(request -> request
               .requestMatchers("/api/register", "/api/loging","/api/search").permitAll()
               .anyRequest().authenticated()
           )
           .sessionManagement(session -> session
               .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
           )
           .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    @Order(1)
    public SecurityFilterChain oauthsecurityFilterChain(HttpSecurity http) throws Exception {
        http
            
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/oauth/error","/api/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2AuthenticationSuccessHandler())
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService())
                )
            );

        return http.build();
    }

    @Bean
    public AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler() {
        return (request, response, authentication) -> {
            // Generate JWT token
            String token = jwtService.generateToken(authentication);
            
            // Redirect to frontend with token as query parameter
            response.sendRedirect(frontendUrl + "/oauth/callback?token=" + token);
        };
    }

    @Bean
    public CustomOAuth2UserService customOAuth2UserService() {
        return new CustomOAuth2UserService();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setPasswordEncoder(new BCryptPasswordEncoder(12));
        provider.setUserDetailsService(userDetailsService);
        return provider;
    }

    @Bean 
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "https://your-frontend-domain.com")); // Allowed origins
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS")); // Allowed HTTP methods
        configuration.setAllowedHeaders(List.of("*")); // Allowed headers
        configuration.setAllowCredentials(true); // Allow credentials (cookies, auth headers)
        configuration.setMaxAge(3600L); // Cache preflight requests for 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Apply to all paths
        return source;
    }
}