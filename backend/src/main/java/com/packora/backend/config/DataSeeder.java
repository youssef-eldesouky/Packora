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
        if (!userRepository.existsByEmail(adminEmail)) {
            log.info("Seeding default Admin user: {}", adminEmail);
            Admin admin = new Admin();
            admin.setUsername("admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("Packora@Admin2026"));
            admin.setPermissionsLevel("ALL");
            userRepository.save(admin);
            log.info("Default Admin user seeded successfully.");
        } else {
            log.debug("Admin user {} already exists. Skipping seeding.", adminEmail);
        }
    }

    private void seedSupportUsers() {
        String support1Email = "support.packora1@gmail.com";
        if (!userRepository.existsByEmail(support1Email)) {
            log.info("Seeding default Support user 1: {}", support1Email);
            SupportStaff support1 = new SupportStaff();
            support1.setUsername("support1");
            support1.setEmail(support1Email);
            support1.setPassword(passwordEncoder.encode("Packora@Support2026"));
            support1.setShiftTime("DAY");
            userRepository.save(support1);
            log.info("Default Support user 1 seeded successfully.");
        } else {
            log.debug("Support user {} already exists. Skipping seeding.", support1Email);
        }

        String support2Email = "support.packora2@gmail.com";
        if (!userRepository.existsByEmail(support2Email)) {
            log.info("Seeding default Support user 2: {}", support2Email);
            SupportStaff support2 = new SupportStaff();
            support2.setUsername("support2");
            support2.setEmail(support2Email);
            support2.setPassword(passwordEncoder.encode("Packora@Support2026"));
            support2.setShiftTime("NIGHT");
            userRepository.save(support2);
            log.info("Default Support user 2 seeded successfully.");
        } else {
            log.debug("Support user {} already exists. Skipping seeding.", support2Email);
        }
    }
}
