package com.packora.backend.service;

import com.packora.backend.dto.user.UserPasswordUpdateRequest;
import com.packora.backend.dto.user.UserProfileUpdateRequest;
import com.packora.backend.dto.user.UserResponse;

import java.util.List;

public interface UserService {
    
    UserResponse getCurrentUser(Long userId);

    UserResponse updateProfile(Long userId, UserProfileUpdateRequest request);

    void updatePassword(Long userId, UserPasswordUpdateRequest request);

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long id);

    // Saved Addresses
    java.util.List<com.packora.backend.dto.user.SavedAddressResponse> getSavedAddresses(Long userId);
    com.packora.backend.dto.user.SavedAddressResponse addAddress(Long userId, com.packora.backend.dto.user.SavedAddressRequest request);
    com.packora.backend.dto.user.SavedAddressResponse updateAddress(Long userId, Long addressId, com.packora.backend.dto.user.SavedAddressRequest request);
    void deleteAddress(Long userId, Long addressId);
    void setPrimaryAddress(Long userId, Long addressId);
}
