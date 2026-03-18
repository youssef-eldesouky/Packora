package com.packora.backend.service;

import com.packora.backend.dto.PackageRequestDTO;

public interface PackagingService {
    String calculateQuote(PackageRequestDTO request);
}
