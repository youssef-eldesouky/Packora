package com.packora.backend.repository;

import com.packora.backend.model.CustomBoxConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CustomBoxConfigRepository extends JpaRepository<CustomBoxConfig, Long> {

    List<CustomBoxConfig> findByUserIdAndIsSavedDraftTrueOrderByUpdatedAtDesc(Long userId);

    @Modifying
    @Query(value = "DELETE FROM custom_box_configs " +
            "WHERE is_saved_draft = false " +
            "  AND id NOT IN (SELECT custom_box_config_id FROM cart_items WHERE custom_box_config_id IS NOT NULL) " +
            "  AND id NOT IN (SELECT custom_box_config_id FROM order_items WHERE custom_box_config_id IS NOT NULL) " +
            "  AND created_at < :cutoffDate", nativeQuery = true)
    int deleteOrphanedConfigs(@Param("cutoffDate") LocalDateTime cutoffDate);
}
