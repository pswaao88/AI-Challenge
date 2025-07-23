package AI_Challenge.AI_Challenge.domain.document.service;

import AI_Challenge.AI_Challenge.domain.document.entity.Document;
import AI_Challenge.AI_Challenge.domain.document.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final String uploadPath = "C:/upload/"; // 실제 경로로 수정 필요

    // 문서 업로드
    @Transactional
    public Document uploadDocument(MultipartFile file) throws Exception {
        // 파일 확장자 검사
        String originalFilename = file.getOriginalFilename();
        if (!isValidFileType(originalFilename)) {
            throw new IllegalArgumentException("올바른 파일 형식이 아닙니다.");
        }

        // 저장할 파일명 생성
        String storedFileName = UUID.randomUUID() + "_" + originalFilename;
        String filePath = uploadPath + storedFileName;

        // 파일 저장
        file.transferTo(new File(filePath));

        // DB에 저장
        Document document = Document.builder()
            .name(originalFilename)
            .storedFileName(storedFileName)
            .filePath(filePath)
            .build();

        return documentRepository.save(document);
    }

    // 모든 문서 조회
    @Transactional(readOnly = true)
    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    // 파일 타입 검사
    private boolean isValidFileType(String filename) {
        return filename.toLowerCase().endsWith(".doc") ||
            filename.toLowerCase().endsWith(".docx") ||
            filename.toLowerCase().endsWith(".pdf");
    }
}
