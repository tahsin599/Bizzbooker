// package com.tahsin.backend.Service;

// import io.jsonwebtoken.Claims;
// import io.jsonwebtoken.Jwts;
// import io.jsonwebtoken.SignatureAlgorithm;
// import io.jsonwebtoken.io.Decoders;
// import io.jsonwebtoken.security.Keys;

// import org.springframework.security.core.Authentication;
// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.security.oauth2.core.user.OAuth2User;
// import org.springframework.stereotype.Service;

// import javax.crypto.KeyGenerator;
// import javax.crypto.SecretKey;
// import java.security.NoSuchAlgorithmException;
// import java.util.Base64;
// import java.util.Date;
// import java.util.HashMap;
// import java.util.Map;
// import java.util.function.Function;

// @Service
// public class JWTService {

//     private String secretkey = "";

//     public JWTService() {

//         try {
//             KeyGenerator keyGen = KeyGenerator.getInstance("HmacSHA256");
//             SecretKey sk = keyGen.generateKey();
//             secretkey = Base64.getEncoder().encodeToString(sk.getEncoded());
//         } catch (NoSuchAlgorithmException e) {
//             throw new RuntimeException(e);
//         }
//     }

//     public String generateToken(String username) {
//         Map<String, Object> claims = new HashMap<>();
//         return Jwts.builder()
//                 .claims()
//                 .add(claims)
//                 .subject(username)
//                 .issuedAt(new Date(System.currentTimeMillis()))
//                 .expiration(new Date(System.currentTimeMillis() + 60 * 60 * 30))
//                 .and()
//                 .signWith(getKey())
//                 .compact();

//     }

//     public String generateToken(Authentication authentication) {
//         UserDetails userDetails = (UserDetails) authentication.getPrincipal();
//         Date now = new Date();
//         // Date expiryDate = new Date(now.getTime() + jwtExpiration);

//         return Jwts.builder()
//                 .claims()
                
//                 .subject(userDetails.getUsername())
//                 .issuedAt(new Date(System.currentTimeMillis()))
//                 .expiration(new Date(System.currentTimeMillis() + 60 * 60 * 30))
//                 .and()
//                 .signWith(getKey())
//                 .compact();
//     }

//     private SecretKey getKey() {
//         byte[] keyBytes = Decoders.BASE64.decode(secretkey);
//         return Keys.hmacShaKeyFor(keyBytes);
//     }

//     public String extractUserName(String token) {
//         // extract the username from jwt token
//         return extractClaim(token, Claims::getSubject);
//     }

//     private <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
//         final Claims claims = extractAllClaims(token);
//         return claimResolver.apply(claims);
//     }

//     private Claims extractAllClaims(String token) {
//         return Jwts.parser()
//                 .verifyWith(getKey())
//                 .build()
//                 .parseSignedClaims(token)
//                 .getPayload();
//     }

//     public boolean validateToken(String token, UserDetails userDetails) {
//         final String userName = extractUserName(token);
//         return (userName.equals(userDetails.getUsername()) && !isTokenExpired(token));
//     }

//     private boolean isTokenExpired(String token) {
//         return extractExpiration(token).before(new Date());
//     }

//     private Date extractExpiration(String token) {
//         return extractClaim(token, Claims::getExpiration);
//     }

// }


package com.tahsin.backend.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JWTService {

    private final String secretKey;
    private static final long EXPIRATION_TIME = 60 * 60 * 30 * 1000; // 30 hours in milliseconds

    public JWTService() {
        this.secretKey = generateSecureKey();
    }

    private String generateSecureKey() {
        try {
            KeyGenerator keyGen = KeyGenerator.getInstance("HmacSHA256");
            SecretKey secretKey = keyGen.generateKey();
            return Base64.getEncoder().encodeToString(secretKey.getEncoded());
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to generate secret key", e);
        }
    }

    public String generateToken(String username) {
        return buildToken(username, new HashMap<>());
    }

    public String generateToken(Authentication authentication) {
        String username;
        
        if (authentication.getPrincipal() instanceof UserDetails) {
            // Standard username/password authentication
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            username = userDetails.getUsername();
        } else if (authentication.getPrincipal() instanceof OAuth2User) {
            // OAuth2 authentication (Google, etc.)
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
            username = oauth2User.getAttribute("email"); // Using email as username
        } else {
            throw new IllegalArgumentException("Unsupported authentication type");
        }
        
        return buildToken(username, new HashMap<>());
    }

    @SuppressWarnings("deprecation")
    private String buildToken(String subject, Map<String, Object> claims) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}