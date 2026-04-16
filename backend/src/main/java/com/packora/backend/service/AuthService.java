package com.packora.backend.service;

import com.packora.backend.dto.LoginRequest;
import com.packora.backend.dto.RegisterRequest;
import com.packora.backend.model.*;
import com.packora.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        User user = createUserSubclass(request.getRole());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setCompanyName(request.getCompanyName());
        user.setServiceType(request.getServiceType());

        return userRepository.save(user);
    }

    private User createUserSubclass(String role) {
        if (role == null) {
            throw new RuntimeException("Error: Role must be provided.");
        }

        switch (role.toUpperCase()) {
            case "ADMIN":
                return new Admin();
            case "BUSINESS_OWNER":
                return new BusinessOwner();
            case "SUPPORT_STAFF":
                return new SupportStaff();
            case "PARTNER_PACKAGING":
                return new PartnerPackaging();
            case "PARTNER_SHIPPING":
                return new PartnerShipping();
            default:
                throw new RuntimeException("Error: Role is not found.");
        }
    }
}
