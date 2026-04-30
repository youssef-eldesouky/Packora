package com.packora.backend.service;

import com.packora.backend.dto.design.DesignResponse;
import com.packora.backend.exception.ResourceNotFoundException;
import com.packora.backend.model.Design;
import com.packora.backend.model.User;
import com.packora.backend.repository.DesignRepository;
import com.packora.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of DesignService — CRUD with file upload via FileStorageService.
 */
@Service
public class DesignServiceImpl implements DesignService {

    private static final Logger log = LoggerFactory.getLogger(DesignServiceImpl.class);
    private static final String DESIGNS_DIR = "designs";

    private final DesignRepository designRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public DesignServiceImpl(DesignRepository designRepository,
                             UserRepository userRepository,
                             FileStorageService fileStorageService) {
        this.designRepository = designRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  CRUD
    // ═══════════════════════════════════════════════════════════════════════════

    @Override
    public List<DesignResponse> getAllDesigns() {
        log.info("[DesignService] Fetching all designs");
        return designRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DesignResponse getDesignById(Long id) {
        log.info("[DesignService] Fetching design id={}", id);
        Design design = designRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Design", id));
        return toResponse(design);
    }

    @Override
    @Transactional
    public DesignResponse createDesign(Long partnerId,
                                       MultipartFile logoFile,
                                       MultipartFile artworkFile,
                                       String previewUrl) {
        log.info("[DesignService] Creating design for partnerId={}", partnerId);

        User partner = userRepository.findById(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("User (Partner)", partnerId));

        Design design = new Design();
        design.setPartner(partner);
        design.setPreviewUrl(previewUrl);

        // Store uploaded files
        if (logoFile != null && !logoFile.isEmpty()) {
            String logoPath = fileStorageService.storeFile(logoFile, DESIGNS_DIR);
            design.setLogoFile(logoPath);
        }
        if (artworkFile != null && !artworkFile.isEmpty()) {
            String artworkPath = fileStorageService.storeFile(artworkFile, DESIGNS_DIR);
            design.setArtworkFile(artworkPath);
        }

        Design saved = designRepository.save(design);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public DesignResponse updateDesign(Long id,
                                       MultipartFile logoFile,
                                       MultipartFile artworkFile,
                                       String previewUrl) {
        log.info("[DesignService] Updating design id={}", id);

        Design design = designRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Design", id));

        if (previewUrl != null) {
            design.setPreviewUrl(previewUrl);
        }

        // Replace logo if a new file is provided
        if (logoFile != null && !logoFile.isEmpty()) {
            // Delete old file
            fileStorageService.deleteFile(design.getLogoFile());
            String logoPath = fileStorageService.storeFile(logoFile, DESIGNS_DIR);
            design.setLogoFile(logoPath);
        }

        // Replace artwork if a new file is provided
        if (artworkFile != null && !artworkFile.isEmpty()) {
            fileStorageService.deleteFile(design.getArtworkFile());
            String artworkPath = fileStorageService.storeFile(artworkFile, DESIGNS_DIR);
            design.setArtworkFile(artworkPath);
        }

        Design saved = designRepository.save(design);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteDesign(Long id) {
        log.info("[DesignService] Deleting design id={}", id);
        Design design = designRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Design", id));

        // Clean up stored files
        fileStorageService.deleteFile(design.getLogoFile());
        fileStorageService.deleteFile(design.getArtworkFile());

        designRepository.delete(design);
    }

    @Override
    public List<DesignResponse> getDesignsByPartner(Long partnerId) {
        log.info("[DesignService] Fetching designs for partnerId={}", partnerId);
        return designRepository.findByPartnerId(partnerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  Helpers
    // ═══════════════════════════════════════════════════════════════════════════

    private DesignResponse toResponse(Design d) {
        return DesignResponse.builder()
                .id(d.getId())
                .logoFile(d.getLogoFile())
                .artworkFile(d.getArtworkFile())
                .previewUrl(d.getPreviewUrl())
                .partnerId(d.getPartner() != null ? d.getPartner().getId() : null)
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .build();
    }
}
