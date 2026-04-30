package com.packora.backend.service;

import com.packora.backend.dto.packaging.PackagingRequest;
import com.packora.backend.dto.packaging.PackagingResponse;
import com.packora.backend.dto.packaging.QuoteRequest;
import com.packora.backend.dto.packaging.QuoteResponse;
import com.packora.backend.exception.ResourceNotFoundException;
import com.packora.backend.model.Design;
import com.packora.backend.model.Packaging;
import com.packora.backend.model.User;
import com.packora.backend.repository.DesignRepository;
import com.packora.backend.repository.PackagingRepository;
import com.packora.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementation of PackagingService — full CRUD and real pricing logic.
 */
@Service
public class PackagingServiceImpl implements PackagingService {

    private static final Logger log = LoggerFactory.getLogger(PackagingServiceImpl.class);

    private final PackagingRepository packagingRepository;
    private final DesignRepository designRepository;
    private final UserRepository userRepository;

    // ── Material base prices (per cm² equivalent) ──
    private static final Map<String, Double> MATERIAL_BASE_PRICES = Map.of(
            "cardboard",   0.50,
            "corrugated",  0.85,
            "kraft",       0.70,
            "rigid",       1.20,
            "plastic",     0.60,
            "biodegradable", 0.95
    );

    // ── Colors that do NOT incur a surcharge ──
    private static final Set<String> FREE_COLORS = Set.of(
            "natural", "kraft", "brown", "white", ""
    );

    private static final double COLOR_SURCHARGE_PERCENT = 0.15; // 15%

    public PackagingServiceImpl(PackagingRepository packagingRepository,
                                DesignRepository designRepository,
                                UserRepository userRepository) {
        this.packagingRepository = packagingRepository;
        this.designRepository = designRepository;
        this.userRepository = userRepository;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  CRUD
    // ═══════════════════════════════════════════════════════════════════════════

    @Override
    public List<PackagingResponse> getAllPackagings() {
        log.info("[PackagingService] Fetching all packagings");
        return packagingRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PackagingResponse getPackagingById(Long id) {
        log.info("[PackagingService] Fetching packaging id={}", id);
        Packaging packaging = packagingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Packaging", id));
        return toResponse(packaging);
    }

    @Override
    @Transactional
    public PackagingResponse createPackaging(PackagingRequest request) {
        log.info("[PackagingService] Creating packaging type={}", request.getType());
        Packaging packaging = new Packaging();
        applyRequest(packaging, request);
        Packaging saved = packagingRepository.save(packaging);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public PackagingResponse updatePackaging(Long id, PackagingRequest request) {
        log.info("[PackagingService] Updating packaging id={}", id);
        Packaging packaging = packagingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Packaging", id));
        applyRequest(packaging, request);
        Packaging saved = packagingRepository.save(packaging);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deletePackaging(Long id) {
        log.info("[PackagingService] Deleting packaging id={}", id);
        if (!packagingRepository.existsById(id)) {
            throw new ResourceNotFoundException("Packaging", id);
        }
        packagingRepository.deleteById(id);
    }

    @Override
    public List<PackagingResponse> getPackagingsByType(String type) {
        return packagingRepository.findByType(type).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PackagingResponse> getPackagingsByPartner(Long partnerId) {
        return packagingRepository.findByPartnerId(partnerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  Quote Calculation
    // ═══════════════════════════════════════════════════════════════════════════

    @Override
    public QuoteResponse calculateQuote(QuoteRequest request) {
        log.info("[PackagingService] Calculating quote — material={}, qty={}",
                request.getMaterial(), request.getQuantity());

        Map<String, String> breakdown = new LinkedHashMap<>();

        // 1. Base material cost
        String materialKey = request.getMaterial().toLowerCase().trim();
        double baseCost = MATERIAL_BASE_PRICES.getOrDefault(materialKey, 0.75);
        breakdown.put("baseMaterialCost", String.format("$%.2f per unit (%s)", baseCost, materialKey));

        // 2. Surface area factor (dimensions in cm → m²)
        double w = request.getWidth();
        double h = request.getHeight();
        double l = request.getLength();
        double surfaceAreaCm2 = 2 * (w * h + w * l + h * l);
        double surfaceAreaFactor = surfaceAreaCm2 / 1000.0; // normalize
        double adjustedUnitPrice = baseCost * (1 + surfaceAreaFactor);
        breakdown.put("surfaceArea", String.format("%.1f cm² → factor %.3f", surfaceAreaCm2, surfaceAreaFactor));

        // 3. Color surcharge
        String color = (request.getColor() != null) ? request.getColor().toLowerCase().trim() : "";
        if (!FREE_COLORS.contains(color) && !color.isEmpty()) {
            double surcharge = adjustedUnitPrice * COLOR_SURCHARGE_PERCENT;
            adjustedUnitPrice += surcharge;
            breakdown.put("colorSurcharge", String.format("+15%% for custom color '%s' = +$%.2f", color, surcharge));
        } else {
            breakdown.put("colorSurcharge", "none (standard color)");
        }

        // 4. Volume discount
        int qty = request.getQuantity();
        double discountPercent = 0;
        if (qty >= 10000) {
            discountPercent = 0.15;
        } else if (qty >= 5000) {
            discountPercent = 0.10;
        } else if (qty >= 1000) {
            discountPercent = 0.05;
        }

        if (discountPercent > 0) {
            double discount = adjustedUnitPrice * discountPercent;
            adjustedUnitPrice -= discount;
            breakdown.put("volumeDiscount", String.format("-%.0f%% for %d+ units = -$%.2f",
                    discountPercent * 100, qty, discount));
        } else {
            breakdown.put("volumeDiscount", "none (qty < 1000)");
        }

        // Round to 2 decimals
        double unitPrice = Math.round(adjustedUnitPrice * 100.0) / 100.0;
        double totalPrice = Math.round(unitPrice * qty * 100.0) / 100.0;

        breakdown.put("unitPrice", String.format("$%.2f", unitPrice));
        breakdown.put("totalPrice", String.format("$%.2f (%d × $%.2f)", totalPrice, qty, unitPrice));

        return QuoteResponse.builder()
                .unitPrice(unitPrice)
                .totalPrice(totalPrice)
                .currency("USD")
                .quantity(qty)
                .breakdown(breakdown)
                .build();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  Helpers
    // ═══════════════════════════════════════════════════════════════════════════

    private void applyRequest(Packaging packaging, PackagingRequest request) {
        packaging.setType(request.getType());
        packaging.setMaterial(request.getMaterial());
        packaging.setSize(request.getSize());
        packaging.setColor(request.getColor());
        packaging.setPrice(request.getPrice());

        if (request.getDesignId() != null) {
            Design design = designRepository.findById(request.getDesignId())
                    .orElseThrow(() -> new ResourceNotFoundException("Design", request.getDesignId()));
            packaging.setDesign(design);
        } else {
            packaging.setDesign(null);
        }

        if (request.getPartnerId() != null) {
            User partner = userRepository.findById(request.getPartnerId())
                    .orElseThrow(() -> new ResourceNotFoundException("User (Partner)", request.getPartnerId()));
            packaging.setPartner(partner);
        } else {
            packaging.setPartner(null);
        }
    }

    private PackagingResponse toResponse(Packaging p) {
        return PackagingResponse.builder()
                .id(p.getId())
                .type(p.getType())
                .material(p.getMaterial())
                .size(p.getSize())
                .color(p.getColor())
                .price(p.getPrice())
                .designId(p.getDesign() != null ? p.getDesign().getId() : null)
                .partnerId(p.getPartner() != null ? p.getPartner().getId() : null)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
