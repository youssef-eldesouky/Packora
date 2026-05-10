package com.packora.backend.service;

import com.packora.backend.model.CustomBoxConfig;
import com.packora.backend.model.User;
import com.packora.backend.repository.CustomBoxConfigRepository;
import com.packora.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomBoxConfigService {

    private final CustomBoxConfigRepository configRepository;
    private final UserRepository userRepository;

    @Value("${app.config.draft-expiry-days:7}")
    private int draftExpiryDays;

    @Value("${app.config.timezone:UTC}")
    private String configuredTimezone;

    @Transactional
    public CustomBoxConfig saveConfig(Long userId, String configurationJson, boolean isSavedDraft) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CustomBoxConfig config = CustomBoxConfig.builder()
                .user(user)
                .configurationJson(configurationJson)
                .isSavedDraft(isSavedDraft)
                .build();

        return configRepository.save(config);
    }

    @Transactional
    public CustomBoxConfig updateConfig(Long configId, Long userId, String configurationJson, boolean isSavedDraft) {
        CustomBoxConfig config = configRepository.findById(configId)
                .orElseThrow(() -> new RuntimeException("Configuration not found"));

        if (!config.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to modify this configuration");
        }

        config.setConfigurationJson(configurationJson);
        config.setSavedDraft(isSavedDraft);
        return configRepository.save(config);
    }

    public CustomBoxConfig getConfig(Long configId, Long userId) {
        CustomBoxConfig config = configRepository.findById(configId)
                .orElseThrow(() -> new RuntimeException("Configuration not found"));

        if (!config.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to view this configuration");
        }

        return config;
    }

    public List<CustomBoxConfig> getUserSavedDrafts(Long userId) {
        return configRepository.findByUserIdAndIsSavedDraftTrueOrderByUpdatedAtDesc(userId);
    }

    /**
     * Scheduled job to clean up orphaned custom box configurations.
     * Runs every day at 3:00 AM in the configured timezone.
     */
    @Scheduled(cron = "0 0 3 * * ?", zone = "${app.config.timezone:UTC}")
    @Transactional
    public void cleanupOrphanedConfigs() {
        log.info("Starting cleanup of orphaned CustomBoxConfigs...");
        ZoneId zoneId = ZoneId.of(configuredTimezone);
        LocalDateTime cutoffDate = LocalDateTime.now(zoneId).minusDays(draftExpiryDays);

        int deletedCount = configRepository.deleteOrphanedConfigs(cutoffDate);
        log.info("Finished cleanup of orphaned CustomBoxConfigs. Deleted {} records older than {}.", deletedCount, cutoffDate);
    }
}
