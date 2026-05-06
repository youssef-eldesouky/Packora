package com.packora.backend.controller;

import com.packora.backend.dto.auth.ForgotPasswordRequest;
import com.packora.backend.dto.auth.JwtResponse;
import com.packora.backend.dto.auth.LoginRequest;
import com.packora.backend.dto.auth.MessageResponse;
import com.packora.backend.dto.auth.ResetPasswordRequest;
import com.packora.backend.dto.auth.SignupRequest;
import com.packora.backend.model.BusinessOwner;
import com.packora.backend.repository.UserRepository;
import com.packora.backend.security.jwt.JwtUtils;
import com.packora.backend.security.services.UserDetailsImpl;
import com.packora.backend.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    PasswordResetService passwordResetService;

    // ─────────────────────────────────────────────────
    // POST /api/auth/login
    // ─────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().isEmpty() ? "ROLE_USER"
                : userDetails.getAuthorities().iterator().next().getAuthority();

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                role));
    }

    // ─────────────────────────────────────────────────
    // POST /api/auth/signup
    // ─────────────────────────────────────────────────
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        BusinessOwner user = new BusinessOwner();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setPhone(signUpRequest.getPhone());
        user.setCompanyName(signUpRequest.getCompanyName());

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    // ─────────────────────────────────────────────────
    // POST /api/auth/forgot-password
    // Body: { "email": "user@example.com" }
    //
    // Always returns 200 (prevents user-enumeration attacks).
    // If the email exists a reset link is sent; otherwise nothing happens.
    // ─────────────────────────────────────────────────
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            passwordResetService.initiatePasswordReset(request.getEmail());
        } catch (Exception e) {
            // Swallow all errors — we never reveal whether the email exists
        }
        return ResponseEntity.ok(new MessageResponse(
                "If that email is registered you will receive a reset link shortly."));
    }

    // ─────────────────────────────────────────────────
    // GET /api/auth/validate-reset-token?token=<uuid>
    //
    // Used by the frontend to check whether the link is still valid
    // before rendering the reset-password form.
    // ─────────────────────────────────────────────────
    @GetMapping("/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@RequestParam String token) {
        boolean valid = passwordResetService.validateToken(token);
        if (valid) {
            return ResponseEntity.ok(new MessageResponse("Token is valid."));
        }
        return ResponseEntity.badRequest()
                .body(new MessageResponse("Invalid or expired reset token."));
    }

    // ─────────────────────────────────────────────────
    // POST /api/auth/reset-password
    // Body: { "token": "<uuid>", "newPassword": "..." }
    // ─────────────────────────────────────────────────
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(new MessageResponse("Password has been reset successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }
}
