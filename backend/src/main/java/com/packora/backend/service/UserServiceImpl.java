package com.packora.backend.service;

import com.packora.backend.dto.user.*;
import com.packora.backend.exception.ResourceNotFoundException;
import com.packora.backend.model.User;
import com.packora.backend.model.SavedAddress;
import com.packora.backend.repository.UserRepository;
import com.packora.backend.repository.SavedAddressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SavedAddressRepository savedAddressRepository;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, SavedAddressRepository savedAddressRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.savedAddressRepository = savedAddressRepository;
    }

    @Override
    public UserResponse getCurrentUser(Long userId) {
        User user = getUserEntityById(userId);
        return mapToResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(Long userId, UserProfileUpdateRequest request) {
        User user = getUserEntityById(userId);

        // Check if username or email is changed and already exists
        if (!user.getUsername().equals(request.getUsername()) && userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Error: Username is already taken!");
        }

        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Error: Email is already in use!");
        }

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setCompanyName(request.getCompanyName());

        user = userRepository.save(user);
        return mapToResponse(user);
    }

    @Override
    @Transactional
    public void updatePassword(Long userId, UserPasswordUpdateRequest request) {
        User user = getUserEntityById(userId);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Error: Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public UserResponse getUserById(Long id) {
        User user = getUserEntityById(id);
        return mapToResponse(user);
    }

    private User getUserEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    private UserResponse mapToResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhone(),
                user.getCompanyName(),
                user.getServiceType(),
                user.getRole() != null ? user.getRole() : "USER",
                user.getCreatedAt()
        );
    }

    // ── Saved Address Implementation ───────────────────────────────────────────

    @Override
    public List<SavedAddressResponse> getSavedAddresses(Long userId) {
        return savedAddressRepository.findByUserId(userId).stream()
                .map(this::mapToAddressResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SavedAddressResponse addAddress(Long userId, SavedAddressRequest request) {
        User user = getUserEntityById(userId);
        List<SavedAddress> existing = savedAddressRepository.findByUserId(userId);

        boolean isPrimary = request.getIsPrimary() || existing.isEmpty();

        if (isPrimary) {
            // Unmark any existing primary addresses
            existing.forEach(a -> {
                if (a.getIsPrimary()) {
                    a.setIsPrimary(false);
                    savedAddressRepository.save(a);
                }
            });
        }

        SavedAddress address = SavedAddress.builder()
                .user(user)
                .label(request.getLabel())
                .street(request.getStreet())
                .city(request.getCity())
                .state(request.getState())
                .zip(request.getZip())
                .isPrimary(isPrimary)
                .build();

        address = savedAddressRepository.save(address);
        return mapToAddressResponse(address);
    }

    @Override
    @Transactional
    public SavedAddressResponse updateAddress(Long userId, Long addressId, SavedAddressRequest request) {
        SavedAddress address = savedAddressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        address.setLabel(request.getLabel());
        address.setStreet(request.getStreet());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setZip(request.getZip());

        if (request.getIsPrimary() && !address.getIsPrimary()) {
            List<SavedAddress> existing = savedAddressRepository.findByUserId(userId);
            existing.forEach(a -> {
                if (!a.getId().equals(addressId) && a.getIsPrimary()) {
                    a.setIsPrimary(false);
                    savedAddressRepository.save(a);
                }
            });
            address.setIsPrimary(true);
        } else if (!request.getIsPrimary() && address.getIsPrimary()) {
            // Keep it primary if it is the only one, otherwise we can set it to false
            List<SavedAddress> existing = savedAddressRepository.findByUserId(userId);
            if (existing.size() > 1) {
                address.setIsPrimary(false);
                // Make another one primary
                existing.stream()
                        .filter(a -> !a.getId().equals(addressId))
                        .findFirst()
                        .ifPresent(a -> {
                            a.setIsPrimary(true);
                            savedAddressRepository.save(a);
                        });
            }
        }

        address = savedAddressRepository.save(address);
        return mapToAddressResponse(address);
    }

    @Override
    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        SavedAddress address = savedAddressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        boolean wasPrimary = address.getIsPrimary();
        savedAddressRepository.delete(address);

        if (wasPrimary) {
            List<SavedAddress> remaining = savedAddressRepository.findByUserId(userId);
            if (!remaining.isEmpty()) {
                SavedAddress newPrimary = remaining.get(0);
                newPrimary.setIsPrimary(true);
                savedAddressRepository.save(newPrimary);
            }
        }
    }

    @Override
    @Transactional
    public void setPrimaryAddress(Long userId, Long addressId) {
        List<SavedAddress> addresses = savedAddressRepository.findByUserId(userId);
        boolean found = false;
        for (SavedAddress addr : addresses) {
            if (addr.getId().equals(addressId)) {
                addr.setIsPrimary(true);
                found = true;
            } else {
                addr.setIsPrimary(false);
            }
            savedAddressRepository.save(addr);
        }
        if (!found) {
            throw new ResourceNotFoundException("Address not found with id: " + addressId);
        }
    }

    private SavedAddressResponse mapToAddressResponse(SavedAddress address) {
        return SavedAddressResponse.builder()
                .id(address.getId())
                .label(address.getLabel())
                .street(address.getStreet())
                .city(address.getCity())
                .state(address.getState())
                .zip(address.getZip())
                .isPrimary(address.getIsPrimary())
                .build();
    }
}
