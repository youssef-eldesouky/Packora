package com.packora.backend.service;

import com.packora.backend.dto.design.DesignResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service interface for Design CRUD operations with file upload support.
 */
public interface DesignService {

    List<DesignResponse> getAllDesigns();

    DesignResponse getDesignById(Long id);

    DesignResponse createDesign(Long partnerId,
                                MultipartFile logoFile,
                                MultipartFile artworkFile,
                                String previewUrl);

    DesignResponse updateDesign(Long id,
                                MultipartFile logoFile,
                                MultipartFile artworkFile,
                                String previewUrl);

    void deleteDesign(Long id);

    List<DesignResponse> getDesignsByPartner(Long partnerId);
}
