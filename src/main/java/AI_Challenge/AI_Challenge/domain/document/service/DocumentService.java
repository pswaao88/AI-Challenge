package AI_Challenge.AI_Challenge.domain.document.service;

import AI_Challenge.AI_Challenge.domain.document.entity.Document;
import AI_Challenge.AI_Challenge.domain.document.repository.DocumentRepository;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import lombok.RequiredArgsConstructor;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    @Value("${document.upload.path}")
    private String uploadPath;

    @Transactional(readOnly = true)
    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    @Transactional
    public Document uploadDocument(MultipartFile file) throws Exception {
        validateFile(file);

        // 저장할 파일 경로 생성
        String fileName = file.getOriginalFilename();
        Path targetPath = Paths.get(uploadPath, fileName);

        // 디렉토리가 없으면 생성
        Files.createDirectories(targetPath.getParent());

        // 파일 저장
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // 문서 내용 추출
        String extractedText = extractTextFromDoc(file.getBytes());

        Document document = Document.builder()
            .fileName(fileName)
            .fileType(file.getContentType())
            .filePath(targetPath.toString())
            .content(file.getBytes())
            .uploadDateTime(LocalDateTime.now())
            .extractedText(extractedText)
            .build();

        return documentRepository.save(document);
    }


    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.contains("word")) {
            throw new IllegalArgumentException("DOCS 파일만 업로드 가능합니다.");
        }
    }

    private String extractTextFromDoc(byte[] content) throws Exception {
        try (ByteArrayInputStream bis = new ByteArrayInputStream(content);
            XWPFDocument document = new XWPFDocument(bis);
            XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {

            return extractor.getText();
        }
    }
}
