package com.packora.backend.service;

import com.packora.backend.dto.packaging.PackagingRequest;
import com.packora.backend.dto.packaging.PackagingResponse;
import com.packora.backend.dto.packaging.QuoteRequest;
import com.packora.backend.dto.packaging.QuoteResponse;

import java.util.List;

/**
 * Service interface for Packaging CRUD operations and quote calculation.
 */
public interface PackagingService {

    List<PackagingResponse> getAllPackagings();

    PackagingResponse getPackagingById(Long id);

    PackagingResponse createPackaging(PackagingRequest request);

    PackagingResponse updatePackaging(Long id, PackagingRequest request);

    void deletePackaging(Long id);

    QuoteResponse calculateQuote(QuoteRequest request);

    List<PackagingResponse> getPackagingsByType(String type);

    List<PackagingResponse> getPackagingsByPartner(Long partnerId);
}
