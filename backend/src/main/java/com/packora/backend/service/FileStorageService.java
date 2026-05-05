package com.packora.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Utility service for storing and deleting uploaded files on the local filesystem.
 *
 * Files are saved under: {uploadDir}/{subDirectory}/{uuid_originalFilename}
 *
 * For production, this should be replaced with a cloud storage provider (S3, GCS, etc.).
 */
@Service
public class FileStorageService {

    private final Path uploadRoot;

    public FileStorageService(@Value("${packora.upload-dir:uploads}") String uploadDir) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadRoot);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadDir, e);
        }
    }

    /**
     * Store a file on disk.
     *
     * @param file         the uploaded file
     * @param subDirectory sub-folder under the upload root (e.g. "designs")
     * @return the relative path from the upload root (e.g. "designs/uuid_logo.png")
     */
    public String storeFile(MultipartFile file, String subDirectory) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            Path targetDir = uploadRoot.resolve(subDirectory).normalize();
            Files.createDirectories(targetDir);

            // Generate a unique filename to avoid collisions
            String originalFilename = file.getOriginalFilename();
            String safeName = (originalFilename != null) ? originalFilename.replaceAll("[^a-zA-Z0-9.\\-_]", "_") : "file";
            String storedName = UUID.randomUUID() + "_" + safeName;

            Path targetPath = targetDir.resolve(storedName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            // Return relative path from upload root
            return subDirectory + "/" + storedName;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + file.getOriginalFilename(), e);
        }
    }

    /**
     * Delete a previously stored file.
     *
     * @param relativePath the path relative to the upload root (as returned by storeFile)
     */
    public void deleteFile(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            return;
        }
        try {
            Path filePath = uploadRoot.resolve(relativePath).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log but don't fail — the resource may already be gone
            System.err.println("Warning: could not delete file " + relativePath + ": " + e.getMessage());
        }
    }

    /**
     * Get the absolute path to the upload root directory.
     */
    public Path getUploadRoot() {
        return uploadRoot;
    }
}
