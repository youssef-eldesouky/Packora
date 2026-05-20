package com.packora.backend.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedAddressResponse {
    private Long id;
    private String label;
    private String street;
    private String city;
    private String state;
    private String zip;
    private Boolean isPrimary;
}
