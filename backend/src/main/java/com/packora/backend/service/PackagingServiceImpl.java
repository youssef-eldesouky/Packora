package com.packora.backend.service;

import com.packora.backend.dto.PackageRequestDTO;
import org.springframework.stereotype.Service;

@Service
public class PackagingServiceImpl implements PackagingService {

    @Override
    public String calculateQuote(PackageRequestDTO request) {
        return "$0.00";
    }
}
