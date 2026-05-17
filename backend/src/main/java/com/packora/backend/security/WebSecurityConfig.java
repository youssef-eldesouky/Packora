package com.packora.backend.security;

import com.packora.backend.security.jwt.AuthEntryPointJwt;
import com.packora.backend.security.jwt.AuthTokenFilter;
import com.packora.backend.security.services.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class WebSecurityConfig {

    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Enable CORS (uses WebConfig's CorsRegistry settings)
                .cors(Customizer.withDefaults())
                // Disable CSRF — not needed for stateless JWT
                .csrf(csrf -> csrf.disable())
                // Return 401 JSON on unauthenticated access
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                // No HTTP sessions — JWT is stateless
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                    // ──────────────────────────────────────────────
                    // PUBLIC ENDPOINTS — no JWT required
                    // ──────────────────────────────────────────────

                    // Auth endpoints (login, signup, password reset)
                    .requestMatchers("/api/auth/**").permitAll()

                    // Health check
                    .requestMatchers("/api/status").permitAll()

                    // Product catalog — read-only public access
                    // Write operations (POST/PUT/DELETE) require authentication
                    // and are further restricted to ADMIN via @PreAuthorize
                    .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()

                    // Packaging catalog — read-only public access
                    .requestMatchers(HttpMethod.GET, "/api/packagings/**").permitAll()
                    // Packaging quote calculator — public (no sensitive data)
                    .requestMatchers(HttpMethod.POST, "/api/packagings/quote").permitAll()

                    // Support ticket submission — guests can submit tickets
                    .requestMatchers(HttpMethod.POST, "/api/support/tickets").permitAll()

                    // Chatbot — accessible to both guests and authenticated users
                    .requestMatchers(HttpMethod.POST, "/api/chatbot/ask").permitAll()

                    // Payment callback — Paymob webhook (external server-to-server, no JWT)
                    .requestMatchers(HttpMethod.POST, "/api/payment/callback").permitAll()
                    // Payment GET redirect — browser redirect from Paymob after card form (no JWT)
                    .requestMatchers(HttpMethod.GET,  "/api/payment/callback").permitAll()
                    // Payment health check
                    .requestMatchers(HttpMethod.GET, "/api/payment/health").permitAll()

                    // Static uploaded files (design assets, logos, etc.)
                    .requestMatchers("/uploads/**").permitAll()

                    // ──────────────────────────────────────────────
                    // AUTHENTICATED ENDPOINTS — JWT required
                    // ──────────────────────────────────────────────
                    // Everything else requires a valid JWT token.
                    // Further role restrictions (ADMIN, PARTNER_SHIPPING, etc.)
                    // are enforced via @PreAuthorize at the controller level.
                    .anyRequest().authenticated()
                );

        http.authenticationProvider(authenticationProvider());

        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
