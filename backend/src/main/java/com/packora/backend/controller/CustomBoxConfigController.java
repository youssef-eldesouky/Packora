package com.packora.backend.controller;

import com.packora.backend.dto.CustomBoxConfigRequest;
import com.packora.backend.dto.CustomBoxConfigResponse;
import com.packora.backend.model.CustomBoxConfig;
import com.packora.backend.service.CustomBoxConfigService;
import com.packora.backend.security.jwt.JwtUtils;
import com.packora.backend.security.services.UserDetailsImpl;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/custom-boxes")
@RequiredArgsConstructor
@Slf4j
public class CustomBoxConfigController {

    private final CustomBoxConfigService configService;

    private Long getUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) principal).getId();
        }
        throw new RuntimeException("Unauthorized");
    }

    private CustomBoxConfigResponse mapToResponse(CustomBoxConfig config) {
        return CustomBoxConfigResponse.builder()
                .id(config.getId())
                .userId(config.getUser().getId())
                .configurationJson(config.getConfigurationJson())
                .isSavedDraft(config.isSavedDraft())
                .createdAt(config.getCreatedAt())
                .updatedAt(config.getUpdatedAt())
                .build();
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CustomBoxConfigResponse> createConfig(
            @RequestBody CustomBoxConfigRequest requestDto) {
        Long userId = getUserId();
        log.info("[CustomBoxConfigController] POST /api/custom-boxes - userId={}", userId);
        
        CustomBoxConfig config = configService.saveConfig(
                userId, 
                requestDto.getConfigurationJson(), 
                requestDto.isSavedDraft()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(config));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CustomBoxConfigResponse> updateConfig(
            @PathVariable Long id,
            @RequestBody CustomBoxConfigRequest requestDto) {
        Long userId = getUserId();
        log.info("[CustomBoxConfigController] PUT /api/custom-boxes/{} - userId={}", id, userId);

        CustomBoxConfig config = configService.updateConfig(
                id, 
                userId, 
                requestDto.getConfigurationJson(), 
                requestDto.isSavedDraft()
        );
        return ResponseEntity.ok(mapToResponse(config));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CustomBoxConfigResponse> getConfig(
            @PathVariable Long id) {
        Long userId = getUserId();
        log.info("[CustomBoxConfigController] GET /api/custom-boxes/{} - userId={}", id, userId);

        CustomBoxConfig config = configService.getConfig(id, userId);
        return ResponseEntity.ok(mapToResponse(config));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CustomBoxConfigResponse>> getMySavedDrafts() {
        Long userId = getUserId();
        log.info("[CustomBoxConfigController] GET /api/custom-boxes/me - userId={}", userId);

        List<CustomBoxConfig> drafts = configService.getUserSavedDrafts(userId);
        return ResponseEntity.ok(
                drafts.stream().map(this::mapToResponse).collect(Collectors.toList())
        );
    }
}
