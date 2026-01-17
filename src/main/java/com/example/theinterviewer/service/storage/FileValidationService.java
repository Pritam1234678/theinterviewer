package com.example.theinterviewer.service.storage;

import com.example.theinterviewer.exception.InvalidFileException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

@Service
public class FileValidationService {

    @Value("${file.upload.allowed-extensions}")
    private String allowedExtensionsStr;

    @Value("${spring.servlet.multipart.max-file-size}")
    private String maxFileSizeStr;

    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("File is empty");
        }

        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new InvalidFileException("File size exceeds maximum allowed size of 10MB");
        }

        // Validate file extension
        String filename = file.getOriginalFilename();
        if (filename == null || filename.isEmpty()) {
            throw new InvalidFileException("Invalid filename");
        }

        String extension = getFileExtension(filename);
        List<String> allowedExtensions = Arrays.asList(allowedExtensionsStr.split(","));

        if (!allowedExtensions.contains(extension.toLowerCase())) {
            throw new InvalidFileException("File type not allowed. Only PDF and DOCX files are accepted");
        }

        // Validate content type
        String contentType = file.getContentType();
        if (contentType == null) {
            throw new InvalidFileException("Unable to determine file type");
        }

        boolean isValidContentType = contentType.equals("application/pdf") ||
                contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
                contentType.equals("application/msword");

        if (!isValidContentType) {
            throw new InvalidFileException("Invalid file content type");
        }
    }

    public String sanitizeFileName(String filename) {
        if (filename == null) {
            return "resume";
        }
        // Remove any path information
        filename = filename.replaceAll("[\\\\/]", "");
        // Remove any special characters except dots, dashes, and underscores
        filename = filename.replaceAll("[^a-zA-Z0-9._-]", "_");
        return filename;
    }

    public String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }
}
