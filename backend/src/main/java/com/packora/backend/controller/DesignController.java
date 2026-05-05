package com.packora.backend.controller;

import com.packora.backend.dto.design.DesignResponse;
import com.packora.backend.service.DesignService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * DesignController — REST API for design management with file uploads.
 *
 * ┌──────────────────────────────────────────────────────────┬────────────────────────────────────┐
 * │ Endpoint                                                 │ Purpose                            │
 * ├──────────────────────────────────────────────────────────┼────────────────────────────────────┤
 * │ GET    /api/designs                                      │ List all designs                   │
 * │ GET    /api/designs/{id}                                 │ Get single design by ID            │
 * │ POST   /api/designs                                      │ Create design (multipart upload)   │
 * │ PUT    /api/designs/{id}                                 │ Update design (multipart upload)   │
 * │ DELETE /api/designs/{id}                                 │ Delete design + files              │
 * │ GET    /api/designs/partner/{partnerId}                  │ Filter designs by partner          │
 * └──────────────────────────────────────────────────────────┴────────────────────────────────────┘
 *
 * NOTE: POST and PUT endpoints consume multipart/form-data.
 * Files are sent as "logoFile" and "artworkFile" parts, metadata as form fields.
 */
@RestController
@RequestMapping("/api/designs")
public class DesignController {

    private static final Logger log = LoggerFactory.getLogger(DesignController.class);

    private final DesignService designService;

    public DesignController(DesignService designService) {
        this.designService = designService;
    }

    // ── GET /api/designs ───────────────────────────────────────────────────────

    /**
     * List all designs.
     */
    @GetMapping
    public ResponseEntity<List<DesignResponse>> getAllDesigns() {
        log.info("[DesignController] GET /api/designs");
        return ResponseEntity.ok(designService.getAllDesigns());
    }

    // ── GET /api/designs/{id} ──────────────────────────────────────────────────

    /**
     * Get a single design by its ID.
     * Returns 404 if not found.
     */
    @GetMapping("/{id}")
    public ResponseEntity<DesignResponse> getDesignById(@PathVariable Long id) {
        log.info("[DesignController] GET /api/designs/{}", id);
        return ResponseEntity.ok(designService.getDesignById(id));
    }

    // ── POST /api/designs ──────────────────────────────────────────────────────

    /**
     * Create a new design with file uploads.
     *
     * Accepts multipart/form-data with:
     *   - partnerId (required) — the packaging partner creating this design
     *   - logoFile (optional)  — logo image file
     *   - artworkFile (optional) — artwork/design file
     *   - previewUrl (optional) — external preview link
     *
     * Example curl:
     *   curl -X POST http://localhost:8080/api/designs \
     *     -F "partnerId=3" \
     *     -F "logoFile=@logo.png" \
     *     -F "artworkFile=@artwork.pdf" \
     *     -F "previewUrl=https://example.com/preview"
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DesignResponse> createDesign(
            @RequestParam("partnerId") Long partnerId,
            @RequestPart(value = "logoFile", required = false) MultipartFile logoFile,
            @RequestPart(value = "artworkFile", required = false) MultipartFile artworkFile,
            @RequestParam(value = "previewUrl", required = false) String previewUrl) {

        log.info("[DesignController] POST /api/designs — partnerId={}", partnerId);
        DesignResponse response = designService.createDesign(partnerId, logoFile, artworkFile, previewUrl);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── PUT /api/designs/{id} ──────────────────────────────────────────────────

    /**
     * Update an existing design. Only provided files will be replaced;
     * omitting a file part keeps the existing file.
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DesignResponse> updateDesign(
            @PathVariable Long id,
            @RequestPart(value = "logoFile", required = false) MultipartFile logoFile,
            @RequestPart(value = "artworkFile", required = false) MultipartFile artworkFile,
            @RequestParam(value = "previewUrl", required = false) String previewUrl) {

        log.info("[DesignController] PUT /api/designs/{}", id);
        return ResponseEntity.ok(designService.updateDesign(id, logoFile, artworkFile, previewUrl));
    }

    // ── DELETE /api/designs/{id} ───────────────────────────────────────────────

    /**
     * Delete a design and its associated files from storage.
     * Returns 204 No Content on success, 404 if not found.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDesign(@PathVariable Long id) {
        log.info("[DesignController] DELETE /api/designs/{}", id);
        designService.deleteDesign(id);
        return ResponseEntity.noContent().build();
    }

    // ── GET /api/designs/partner/{partnerId} ───────────────────────────────────

    /**
     * List all designs created by a specific packaging partner.
     */
    @GetMapping("/partner/{partnerId}")
    public ResponseEntity<List<DesignResponse>> getDesignsByPartner(@PathVariable Long partnerId) {
        log.info("[DesignController] GET /api/designs/partner/{}", partnerId);
        return ResponseEntity.ok(designService.getDesignsByPartner(partnerId));
    }
}
