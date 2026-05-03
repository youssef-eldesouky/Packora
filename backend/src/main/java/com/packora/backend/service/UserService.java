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
}
