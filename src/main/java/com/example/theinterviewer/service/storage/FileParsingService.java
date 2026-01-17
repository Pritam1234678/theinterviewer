package com.example.theinterviewer.service.storage;

import com.example.theinterviewer.exception.InvalidFileException;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Service
@Slf4j
public class FileParsingService {

    public String parseResume(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new InvalidFileException("Invalid filename");
        }

        String extension = getFileExtension(filename);

        try {
            if ("pdf".equalsIgnoreCase(extension)) {
                return parsePdf(file.getInputStream());
            } else if ("docx".equalsIgnoreCase(extension)) {
                return parseDocx(file.getInputStream());
            } else {
                throw new InvalidFileException("Unsupported file format: " + extension);
            }
        } catch (IOException e) {
            log.error("Error parsing file: {}", filename, e);
            throw new InvalidFileException("Failed to parse file: " + e.getMessage());
        }
    }

    private String parsePdf(InputStream inputStream) throws IOException {
        PDDocument document = null;
        try {
            byte[] pdfBytes = inputStream.readAllBytes();

            // Try lenient loading for corrupted PDFs
            try {
                document = org.apache.pdfbox.Loader.loadPDF(pdfBytes);
            } catch (Exception e) {
                log.warn("Failed to load PDF with strict mode, trying lenient mode: {}", e.getMessage());
                // If strict loading fails, the PDF might be corrupted
                throw new InvalidFileException("PDF file is corrupted or invalid: " + e.getMessage());
            }

            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);

            if (text == null || text.trim().isEmpty()) {
                throw new InvalidFileException("PDF file appears to be empty or unreadable");
            }

            return text.trim();
        } finally {
            if (document != null) {
                try {
                    document.close();
                } catch (IOException e) {
                    log.warn("Error closing PDF document: {}", e.getMessage());
                }
            }
        }
    }

    private String parseDocx(InputStream inputStream) throws IOException {
        try (XWPFDocument document = new XWPFDocument(inputStream)) {
            List<XWPFParagraph> paragraphs = document.getParagraphs();
            StringBuilder text = new StringBuilder();

            for (XWPFParagraph paragraph : paragraphs) {
                text.append(paragraph.getText()).append("\n");
            }

            String result = text.toString().trim();

            if (result.isEmpty()) {
                throw new InvalidFileException("DOCX file appears to be empty or unreadable");
            }

            return result;
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }
}
