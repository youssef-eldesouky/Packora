package com.packora.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    @NotBlank
    private String username;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String role; // "ADMIN", "BUSINESS_OWNER", "SUPPORT_STAFF", "PARTNER_PACKAGING", "PARTNER_SHIPPING"

    // Optional fields for some subtypes
    private String phone;
    private String companyName;
    private String serviceType;
}
