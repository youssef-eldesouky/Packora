package com.packora.backend.controller;

import com.packora.backend.dto.AuthResponse;
import com.packora.backend.dto.LoginRequest;
import com.packora.backend.dto.RegisterRequest;
import com.packora.backend.security.JwtUtil;
import com.packora.backend.security.UserDetailsServiceImpl;
import com.packora.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            authService.registerUser(registerRequest);
            return ResponseEntity.ok(new AuthResponse(null, "User registered successfully!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new AuthResponse(null, e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getIdentifier(), loginRequest.getPassword()));

            final UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getIdentifier());
            final String jwt = jwtUtil.generateToken(userDetails);

            return ResponseEntity.ok(new AuthResponse(jwt, "Login successful"));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new AuthResponse(null, "Invalid username/email or password"));
        }
    }
}
