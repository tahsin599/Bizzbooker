package com.tahsin.backend.Configuration;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.tahsin.backend.Service.JWTService;
import com.tahsin.backend.Service.MyUserDetailsService;

import io.jsonwebtoken.security.SignatureException;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtFilter.class);
    
    @Autowired
    private JWTService jwtService;

    @Autowired
    ApplicationContext context;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) 
            throws IOException, ServletException {
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                username = jwtService.extractUsername(token);
            } catch (SignatureException e) {
                logger.warn("Invalid JWT signature for request to {}: {}", request.getRequestURI(), e.getMessage());
            } catch (ExpiredJwtException e) {
                logger.warn("Expired JWT token for request to {}: {}", request.getRequestURI(), e.getMessage());
            } catch (MalformedJwtException e) {
                logger.warn("Malformed JWT token for request to {}: {}", request.getRequestURI(), e.getMessage());
            } catch (Exception e) {
                logger.warn("JWT processing error for request to {}: {}", request.getRequestURI(), e.getMessage());
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = context.getBean(MyUserDetailsService.class).loadUserByUsername(username);
                if (jwtService.validateToken(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = 
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception e) {
                logger.warn("Failed to authenticate user {} for request to {}: {}", username, request.getRequestURI(), e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}