package com.packora.backend.config;

import com.packora.backend.model.Admin;
import com.packora.backend.model.SupportStaff;
import com.packora.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        seedAdminUser();
        seedSupportUsers();
    }

    private void seedAdminUser() {
        String adminEmail = "adminpackora@gmail.com";
        String adminUsername = "admin";
        if (userRepository.existsByEmail(adminEmail) || userRepository.existsByUsername(adminUsername)) {
            log.info("Admin user (email: {} or username: {}) already exists. Skipping seeding.", adminEmail, adminUsername);
        } else {
            log.info("Seeding default Admin user: {}", adminEmail);
            Admin admin = new Admin();
            admin.setUsername(adminUsername);
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("Packora@Admin2026"));
            admin.setPermissionsLevel("ALL");
            userRepository.save(admin);
            log.info("Default Admin user seeded successfully.");
        }
    }

    private void seedSupportUsers() {
        String support1Email = "support.packora1@gmail.com";
        String support1Username = "support1";
        if (userRepository.existsByEmail(support1Email) || userRepository.existsByUsername(support1Username)) {
            log.info("Support user 1 (email: {} or username: {}) already exists. Skipping seeding.", support1Email, support1Username);
        } else {
            log.info("Seeding default Support user 1: {}", support1Email);
            SupportStaff support1 = new SupportStaff();
            support1.setUsername(support1Username);
            support1.setEmail(support1Email);
            support1.setPassword(passwordEncoder.encode("Packora@Support2026"));
            support1.setShiftTime("DAY");
            userRepository.save(support1);
            log.info("Default Support user 1 seeded successfully.");
        }

        String support2Email = "support.packora2@gmail.com";
        String support2Username = "support2";
        if (userRepository.existsByEmail(support2Email) || userRepository.existsByUsername(support2Username)) {
            log.info("Support user 2 (email: {} or username: {}) already exists. Skipping seeding.", support2Email, support2Username);
        } else {
            log.info("Seeding default Support user 2: {}", support2Email);
            SupportStaff support2 = new SupportStaff();
            support2.setUsername(support2Username);
            support2.setEmail(support2Email);
            support2.setPassword(passwordEncoder.encode("Packora@Support2026"));
            support2.setShiftTime("NIGHT");
            userRepository.save(support2);
            log.info("Default Support user 2 seeded successfully.");
        }
    }
}
