package com.packora.backend.repository;

import com.packora.backend.model.PasswordResetToken;
import com.packora.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    /** Used to delete any existing token before issuing a new one */
    void deleteByUser(User user);
}
