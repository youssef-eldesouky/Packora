package com.packora.backend.controller;

import com.packora.backend.dto.auth.MessageResponse;
import com.packora.backend.dto.user.UserPasswordUpdateRequest;
import com.packora.backend.dto.user.UserProfileUpdateRequest;
import com.packora.backend.dto.user.UserResponse;
import com.packora.backend.security.services.UserDetailsImpl;
import com.packora.backend.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ── Profile Endpoints (Current User) ───────────────────────────────────────

    /**
     * Get current authenticated user's profile.
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl principal) {
        log.info("[UserController] GET /api/users/me — userId={}", principal.getId());
        return ResponseEntity.ok(userService.getCurrentUser(principal.getId()));
    }

    /**
     * Update current authenticated user's profile.
     */
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @Valid @RequestBody UserProfileUpdateRequest request) {
        log.info("[UserController] PUT /api/users/me — userId={}", principal.getId());
        return ResponseEntity.ok(userService.updateProfile(principal.getId(), request));
    }

    /**
     * Update current authenticated user's password.
     */
    @PutMapping("/me/password")
    public ResponseEntity<MessageResponse> updatePassword(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @Valid @RequestBody UserPasswordUpdateRequest request) {
        log.info("[UserController] PUT /api/users/me/password — userId={}", principal.getId());
        userService.updatePassword(principal.getId(), request);
        return ResponseEntity.ok(new MessageResponse("Password updated successfully!"));
    }

    // ── Saved Address Endpoints ────────────────────────────────────────────────

    @GetMapping("/me/addresses")
    public ResponseEntity<List<com.packora.backend.dto.user.SavedAddressResponse>> getMyAddresses(
            @AuthenticationPrincipal UserDetailsImpl principal) {
        log.info("[UserController] GET /api/users/me/addresses — userId={}", principal.getId());
        return ResponseEntity.ok(userService.getSavedAddresses(principal.getId()));
    }

    @PostMapping("/me/addresses")
    public ResponseEntity<com.packora.backend.dto.user.SavedAddressResponse> addMyAddress(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @Valid @RequestBody com.packora.backend.dto.user.SavedAddressRequest request) {
        log.info("[UserController] POST /api/users/me/addresses — userId={}", principal.getId());
        return ResponseEntity.ok(userService.addAddress(principal.getId(), request));
    }

    @PutMapping("/me/addresses/{id}")
    public ResponseEntity<com.packora.backend.dto.user.SavedAddressResponse> updateMyAddress(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable Long id,
            @Valid @RequestBody com.packora.backend.dto.user.SavedAddressRequest request) {
        log.info("[UserController] PUT /api/users/me/addresses/{} — userId={}", id, principal.getId());
        return ResponseEntity.ok(userService.updateAddress(principal.getId(), id, request));
    }

    @DeleteMapping("/me/addresses/{id}")
    public ResponseEntity<MessageResponse> deleteMyAddress(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable Long id) {
        log.info("[UserController] DELETE /api/users/me/addresses/{} — userId={}", id, principal.getId());
        userService.deleteAddress(principal.getId(), id);
        return ResponseEntity.ok(new MessageResponse("Address deleted successfully!"));
    }

    @PutMapping("/me/addresses/{id}/primary")
    public ResponseEntity<MessageResponse> setMyPrimaryAddress(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable Long id) {
        log.info("[UserController] PUT /api/users/me/addresses/{}/primary — userId={}", id, principal.getId());
        userService.setPrimaryAddress(principal.getId(), id);
        return ResponseEntity.ok(new MessageResponse("Primary address set successfully!"));
    }

    // ── Admin Endpoints ────────────────────────────────────────────────────────

    /**
     * List all users. Admin only.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        log.info("[UserController] GET /api/users");
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /**
     * Get details of a specific user. Admin only.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        log.info("[UserController] GET /api/users/{}", id);
        return ResponseEntity.ok(userService.getUserById(id));
    }
}
