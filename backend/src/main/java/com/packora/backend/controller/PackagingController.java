package com.packora.backend.controller;

import com.packora.backend.dto.packaging.PackagingRequest;
import com.packora.backend.dto.packaging.PackagingResponse;
import com.packora.backend.dto.packaging.QuoteRequest;
import com.packora.backend.dto.packaging.QuoteResponse;
import com.packora.backend.service.PackagingService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * PackagingController — REST API for packaging catalog and quote calculation.
 *
 * ┌──────────────────────────────────────────────────────────┬────────────────────────────────────┐
 * │ Endpoint                                                 │ Purpose                            │
 * ├──────────────────────────────────────────────────────────┼────────────────────────────────────┤
 * │ GET    /api/packagings                                   │ List all packagings (catalog)      │
 * │ GET    /api/packagings/{id}                              │ Get single packaging by ID         │
 * │ POST   /api/packagings                                   │ Create a new packaging             │
 * │ PUT    /api/packagings/{id}                              │ Update an existing packaging       │
 * │ DELETE /api/packagings/{id}                              │ Delete a packaging                 │
 * │ POST   /api/packagings/quote                             │ Calculate a packaging quote        │
 * │ GET    /api/packagings/type/{type}                       │ Filter packagings by type          │
 * │ GET    /api/packagings/partner/{partnerId}               │ Filter packagings by partner       │
 * └──────────────────────────────────────────────────────────┴────────────────────────────────────┘
 */
@RestController
@RequestMapping("/api/packagings")
public class PackagingController {

    private static final Logger log = LoggerFactory.getLogger(PackagingController.class);

    private final PackagingService packagingService;

    public PackagingController(PackagingService packagingService) {
        this.packagingService = packagingService;
    }

    // ── GET /api/packagings ────────────────────────────────────────────────────

    /**
     * List all packaging configurations (catalog-style).
     */
    @GetMapping
    public ResponseEntity<List<PackagingResponse>> getAllPackagings() {
        log.info("[PackagingController] GET /api/packagings");
        return ResponseEntity.ok(packagingService.getAllPackagings());
    }

    // ── GET /api/packagings/{id} ───────────────────────────────────────────────

    /**
     * Get a single packaging by its ID.
     * Returns 404 if not found.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PackagingResponse> getPackagingById(@PathVariable Long id) {
        log.info("[PackagingController] GET /api/packagings/{}", id);
        return ResponseEntity.ok(packagingService.getPackagingById(id));
    }

    // ── POST /api/packagings ───────────────────────────────────────────────────

    /**
     * Create a new packaging configuration.
     *
     * Request body example:
     * {
     *   "type": "Box",
     *   "material": "Corrugated",
     *   "size": "30x20x15",
     *   "color": "Kraft",
     *   "price": 2.50,
     *   "designId": 1,
     *   "partnerId": 3
     * }
     */
    @PostMapping
    public ResponseEntity<PackagingResponse> createPackaging(
            @Valid @RequestBody PackagingRequest request) {
        log.info("[PackagingController] POST /api/packagings — type={}", request.getType());
        PackagingResponse response = packagingService.createPackaging(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── PUT /api/packagings/{id} ───────────────────────────────────────────────

    /**
     * Update an existing packaging configuration.
     * Returns 404 if the packaging does not exist.
     */
    @PutMapping("/{id}")
    public ResponseEntity<PackagingResponse> updatePackaging(
            @PathVariable Long id,
            @Valid @RequestBody PackagingRequest request) {
        log.info("[PackagingController] PUT /api/packagings/{}", id);
        return ResponseEntity.ok(packagingService.updatePackaging(id, request));
    }

    // ── DELETE /api/packagings/{id} ────────────────────────────────────────────

    /**
     * Delete a packaging configuration.
     * Returns 204 No Content on success, 404 if not found.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePackaging(@PathVariable Long id) {
        log.info("[PackagingController] DELETE /api/packagings/{}", id);
        packagingService.deletePackaging(id);
        return ResponseEntity.noContent().build();
    }

    // ── POST /api/packagings/quote ─────────────────────────────────────────────

    /**
     * Calculate a packaging quote based on material, dimensions, quantity, and color.
     *
     * Request body example:
     * {
     *   "material": "Corrugated",
     *   "width": 30.0,
     *   "height": 20.0,
     *   "length": 15.0,
     *   "quantity": 5000,
     *   "color": "Red",
     *   "type": "Box"
     * }
     */
    @PostMapping("/quote")
    public ResponseEntity<QuoteResponse> calculateQuote(
            @Valid @RequestBody QuoteRequest request) {
        log.info("[PackagingController] POST /api/packagings/quote — material={}, qty={}",
                request.getMaterial(), request.getQuantity());
        return ResponseEntity.ok(packagingService.calculateQuote(request));
    }

    // ── GET /api/packagings/type/{type} ────────────────────────────────────────

    /**
     * Filter packagings by type (e.g. "Box", "Mailer", "Pouch").
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<PackagingResponse>> getPackagingsByType(@PathVariable String type) {
        log.info("[PackagingController] GET /api/packagings/type/{}", type);
        return ResponseEntity.ok(packagingService.getPackagingsByType(type));
    }

    // ── GET /api/packagings/partner/{partnerId} ────────────────────────────────

    /**
     * Filter packagings by the partner who manages them.
     */
    @GetMapping("/partner/{partnerId}")
    public ResponseEntity<List<PackagingResponse>> getPackagingsByPartner(@PathVariable Long partnerId) {
        log.info("[PackagingController] GET /api/packagings/partner/{}", partnerId);
        return ResponseEntity.ok(packagingService.getPackagingsByPartner(partnerId));
    }
}
