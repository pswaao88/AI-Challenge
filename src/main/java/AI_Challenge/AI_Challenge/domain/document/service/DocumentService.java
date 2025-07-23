package AI_Challenge.AI_Challenge.domain.document.service;

import AI_Challenge.AI_Challenge.domain.document.dto.DocumentResponseDto;
import AI_Challenge.AI_Challenge.domain.document.entity.Document;
import AI_Challenge.AI_Challenge.domain.document.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final String fileDir = "C:/files/"; // 파일 저장 경로

    @Transactional
    public DocumentResponseDto saveFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }

        // 원본 파일명
        String originalFileName = file.getOriginalFilename();

        // 저장할 파일명 (UUID 사용)
        String storedFileName = UUID.randomUUID().toString() + "_" + originalFileName;

        // 파일 저장
        String fullPath = fileDir + storedFileName;
        file.transferTo(new File(fullPath));

        // 문서 엔티티 생성 및 저장
        Document document = Document.builder()
            .originalFileName(originalFileName)
            .storedFileName(storedFileName)
            .filePath(fullPath)
            .fileSize(file.getSize())
            .fileType(file.getContentType())
            .build();

        documentRepository.save(document);
        return new DocumentResponseDto(document);
    }
}
