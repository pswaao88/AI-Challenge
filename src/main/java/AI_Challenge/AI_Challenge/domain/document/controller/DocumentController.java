package AI_Challenge.AI_Challenge.domain.document.controller;

import AI_Challenge.AI_Challenge.domain.document.dto.MarkdownRequestDTO;
import AI_Challenge.AI_Challenge.domain.document.entity.Document;
import AI_Challenge.AI_Challenge.domain.document.service.DocumentService;
import com.theokanning.openai.service.OpenAiService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/document")
@Slf4j
public class DocumentController {

    private final DocumentService documentService;
    private final OpenAiService openAiService;

    @Autowired
    public DocumentController(DocumentService documentService, @Value("${openai.api.key}") String apiKey) {
        this.openAiService = new OpenAiService(apiKey);
        this.documentService = documentService;
    }

    // 문서 업로드 - document-upload 폴더에 저장
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadDocument(@RequestParam("file") MultipartFile file) {
        try {
            Document document = documentService.uploadDocument(file);

            Map<String, Object> response = new HashMap<>();
            response.put("id", document.getId());
            response.put("fileName", document.getFileName());
            response.put("uploadDateTime", document.getUploadDateTime());
            response.put("message", "업로드 성공");

            log.info("문서 업로드 성공: {} -> document-upload 폴더", document.getFileName());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("문서 업로드 중 오류 발생", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // 모든 문서 조회
    @GetMapping("/list")
    public ResponseEntity<List<Document>> getAllDocuments() {
        try {
            List<Document> documents = documentService.getAllDocuments();
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            log.error("문서 목록 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 문서 처리 - document-result 폴더에 저장하고 다운로드 제공
    @PostMapping("/process-and-download")
    public ResponseEntity<byte[]> processAndDownloadDocument(@RequestBody Map<String, Object> request) {
        try {
            Long documentId = Long.valueOf(request.get("documentId").toString());
            String originalFileName = request.get("fileName").toString();
            Boolean isFromDb = Boolean.valueOf(request.get("isFromDb").toString());

            log.info("문서 처리 시작: {} (ID: {})", originalFileName, documentId);

            // 문서 처리 및 결과 파일 저장
            String resultFileName = documentService.processAndSaveDocument(documentId, originalFileName);

            // 저장된 결과 파일 읽어서 바이트 배열로 반환
            byte[] processedContent = documentService.getProcessedDocumentBytes(resultFileName);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDisposition(ContentDisposition.builder("attachment")
                .filename(resultFileName)
                .build());

            log.info("문서 처리 완료: {} -> document-result/{}", originalFileName, resultFileName);
            return new ResponseEntity<>(processedContent, headers, HttpStatus.OK);

        } catch (Exception e) {
            log.error("문서 처리 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 처리된 문서 목록 조회 (document-result 폴더의 파일들)
    @GetMapping("/processed-list")
    public ResponseEntity<List<Map<String, Object>>> getProcessedDocuments() {
        try {
            List<Map<String, Object>> processedDocs = documentService.getProcessedDocumentsList();
            return ResponseEntity.ok(processedDocs);
        } catch (Exception e) {
            log.error("처리된 문서 목록 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 처리된 문서 다운로드 (document-result 폴더에서)
    @PostMapping("/download-processed")
    public ResponseEntity<byte[]> downloadProcessedDocument(@RequestBody Map<String, String> request) {
        try {
            String fileName = request.get("fileName");
            byte[] fileContent = documentService.getProcessedDocumentBytes(fileName);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDisposition(ContentDisposition.builder("attachment")
                .filename(fileName)
                .build());

            log.info("처리된 문서 다운로드: {}", fileName);
            return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);

        } catch (Exception e) {
            log.error("처리된 문서 다운로드 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/create-and-download")
    public ResponseEntity<byte[]> createAndDownloadDocument(@RequestBody Map<String, Object> request) {
        try {
            // documentId를 안전하게 Long으로 변환
            Long documentId = Long.valueOf(request.get("documentId").toString());
            String textContent = request.get("textContent").toString();

            // 템플릿에 텍스트를 채워 넣고 바이트 배열로 반환하는 서비스 메서드 호출
            byte[] processedContent = documentService.createAndDownloadDocument(documentId, textContent);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDisposition(ContentDisposition.builder("attachment")
                .filename("processed_document.docx") // 동적으로 파일명 설정 가능
                .build());

            return new ResponseEntity<>(processedContent, headers, HttpStatus.OK);

        } catch (Exception e) {
            log.error("새로운 문서 생성 및 다운로드 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @PostMapping("/result")
    public ResponseEntity<byte[]> makeResultDocuments(@RequestParam("text") String extractedText, @RequestParam("document") MultipartFile document) {
        byte[] result = {};
        return ResponseEntity.ok(result);
    }
}
