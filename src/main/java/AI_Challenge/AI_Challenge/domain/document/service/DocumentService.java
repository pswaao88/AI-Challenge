package AI_Challenge.AI_Challenge.domain.document.service;

import AI_Challenge.AI_Challenge.domain.document.entity.Document;
import AI_Challenge.AI_Challenge.domain.document.repository.DocumentRepository;
import com.theokanning.openai.service.OpenAiService;
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final GeminiService geminiService;
    private final GptService gptService;

    @Value("${document.upload.path}")
    private String uploadPath;

    @Value("${document.result.path}")
    private String resultPath;

    public DocumentService(DocumentRepository documentRepository, GeminiService geminiService, GptService gptService) {
        this.documentRepository = documentRepository;
        this.geminiService = geminiService;
        this.gptService = gptService;
    }

    @Transactional(readOnly = true)
    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Document> getDocumentById(Long id) {
        return documentRepository.findById(id);
    }

    @Transactional
    public Document uploadDocument(MultipartFile file) throws Exception {
        validateFile(file);

        // 저장할 파일 경로 생성 (document-upload 폴더)
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

        log.info("문서 업로드 완료: {} -> {}", fileName, targetPath);
        return documentRepository.save(document);
    }

    // 문서 처리 및 결과 파일 저장
    @Transactional
    public String processAndSaveDocument(Long documentId, String originalFileName) throws Exception {
        Document document = documentRepository.findById(documentId)
            .orElseThrow(() -> new RuntimeException("문서를 찾을 수 없습니다: " + documentId));

        // 결과 파일명 생성
        String resultFileName = generateResultFileName(originalFileName);

        // 결과 파일 경로
        Path resultFilePath = Paths.get(resultPath, resultFileName);

        // 결과 디렉토리가 없으면 생성
        Files.createDirectories(resultFilePath.getParent());

        // 여기서는 단순히 원본 파일을 복사하지만,
        // 실제로는 AI 처리 결과를 적용할 수 있습니다
        byte[] processedContent = processDocumentWithAI(document);

        // 결과 파일 저장
        Files.write(resultFilePath, processedContent);

        log.info("문서 처리 및 저장 완료: {} -> {}", originalFileName, resultFilePath);
        return resultFileName;
    }

    // AI로 문서 처리 (현재는 원본 반환, 추후 확장 가능)
    private byte[] processDocumentWithAI(Document document) throws Exception {
        // 여기서 Gemini API 등을 활용해 문서를 처리할 수 있습니다
        // 예: 이미지에서 추출된 텍스트를 문서에 삽입

        // 현재는 원본 문서를 그대로 반환
        return document.getContent();
    }

    // 처리된 문서 바이트 배열 반환
    public byte[] getProcessedDocumentBytes(String fileName) throws Exception {
        Path filePath = Paths.get(resultPath, fileName);

        if (!Files.exists(filePath)) {
            throw new RuntimeException("처리된 문서를 찾을 수 없습니다: " + fileName);
        }

        return Files.readAllBytes(filePath);
    }

    // 처리된 문서 목록 조회
    public List<Map<String, Object>> getProcessedDocumentsList() throws Exception {
        List<Map<String, Object>> processedDocs = new ArrayList<>();
        Path resultDir = Paths.get(resultPath);

        // 결과 디렉토리가 없으면 빈 목록 반환
        if (!Files.exists(resultDir)) {
            Files.createDirectories(resultDir);
            return processedDocs;
        }

        try (DirectoryStream<Path> stream = Files.newDirectoryStream(resultDir)) {
            for (Path path : stream) {
                if (Files.isRegularFile(path)) {
                    Map<String, Object> docInfo = new HashMap<>();
                    docInfo.put("fileName", path.getFileName().toString());
                    docInfo.put("filePath", path.toString());
                    docInfo.put("fileSize", Files.size(path));
                    docInfo.put("lastModified", Files.getLastModifiedTime(path).toString());
                    processedDocs.add(docInfo);
                }
            }
        }

        log.info("처리된 문서 목록 조회: {} 개", processedDocs.size());
        return processedDocs;
    }

    // 결과 파일명 생성 (새로운 네이밍 규칙)
    private String generateResultFileName(String originalFileName) {
        String extension = "";
        String nameWithoutExt = originalFileName;

        int dotIndex = originalFileName.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFileName.substring(dotIndex);
            nameWithoutExt = originalFileName.substring(0, dotIndex);
        }

        // 현재 시간을 포함한 파일명 생성
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        return String.format("(완료)%s_%s%s", nameWithoutExt, timestamp, extension);
    }
    // Docx를 마크다운으로
    public String convertDocxToMarkdown(MultipartFile docxFile) throws IOException, InterruptedException {
        // 1. 임시 DOCX 파일 생성 및 내용 쓰기
        Path tempInputFile = Files.createTempFile("input_", ".docx");
        docxFile.transferTo(tempInputFile);

        log.info("DOCX를 마크다운으로 변환 시작: {}", tempInputFile);

        String markdownContent;
        try {
            // 2. Pandoc 명령어 실행 준비
            ProcessBuilder processBuilder = new ProcessBuilder(
                "pandoc",
                "-f", "docx",      // 입력 포맷: docx
                "-t", "markdown",  // 출력 포맷: markdown
                tempInputFile.toAbsolutePath().toString()
            );

            // 3. Pandoc 실행 및 결과 읽기
            Process process = processBuilder.start();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                StringBuilder result = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    result.append(line).append("\n");
                }
                markdownContent = result.toString();
            }

            // 4. 프로세스 에러 처리
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                String errorOutput = new String(process.getErrorStream().readAllBytes(), StandardCharsets.UTF_8);
                log.error("Pandoc 실행 오류 (Exit code: {}): {}", exitCode, errorOutput);
                throw new RuntimeException("DOCX를 Markdown으로 변환하는 데 실패했습니다.");
            }
        } finally {
            // 5. 임시 파일 삭제
            Files.deleteIfExists(tempInputFile);
            log.info("임시 파일 삭제 완료: {}", tempInputFile);
        }
        return markdownContent;
    }

    // 마크다운을 Docx로
    public byte[] convertMarkdownToDocx(String markdownContent) throws IOException, InterruptedException {
        // 1. 임시 마크다운 파일 생성 및 내용 쓰기
        Path tempInputFile = Files.createTempFile("input_", ".md");
        Files.writeString(tempInputFile, markdownContent, StandardCharsets.UTF_8);

        // 2. 변환된 DOCX가 저장될 임시 출력 파일 경로 지정
        Path tempOutputFile = Files.createTempFile("output_", ".docx");

        log.info("마크다운을 DOCX로 변환 시작. 입력: {}, 출력: {}", tempInputFile, tempOutputFile);

        byte[] docxBytes;
        try {
            // 3. Pandoc 명령어 실행 준비
            ProcessBuilder processBuilder = new ProcessBuilder(
                "pandoc",
                "-f", "markdown", // 입력 포맷: markdown
                "-t", "docx",     // 출력 포맷: docx
                "-o", tempOutputFile.toAbsolutePath().toString(), // 출력 파일 경로 지정
                tempInputFile.toAbsolutePath().toString()
            );

            // 4. Pandoc 실행 및 종료 대기
            Process process = processBuilder.start();
            int exitCode = process.waitFor();

            // 5. 프로세스 에러 처리
            if (exitCode != 0) {
                String errorOutput = new String(process.getErrorStream().readAllBytes(), StandardCharsets.UTF_8);
                log.error("Pandoc 실행 오류 (Exit code: {}): {}", exitCode, errorOutput);
                throw new RuntimeException("Markdown을 DOCX로 변환하는 데 실패했습니다.");
            }

            // 6. 생성된 DOCX 파일의 내용을 byte 배열로 읽기
            docxBytes = Files.readAllBytes(tempOutputFile);

        } finally {
            // 7. 사용한 임시 파일 모두 삭제
            Files.deleteIfExists(tempInputFile);
            Files.deleteIfExists(tempOutputFile);
            log.info("임시 파일 삭제 완료: {}, {}", tempInputFile, tempOutputFile);
        }
        return docxBytes;
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("빈 파일입니다.");
        }

        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.toLowerCase().matches(".*\\.(doc|docx)$")) {
            throw new RuntimeException("지원하지 않는 파일 형식입니다. .doc 또는 .docx 파일만 업로드 가능합니다.");
        }
    }

    public String extractTextFromDoc(byte[] content) throws Exception {
        try (ByteArrayInputStream bis = new ByteArrayInputStream(content);
            XWPFDocument document = new XWPFDocument(bis);
            XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {

            return extractor.getText();
        }
    }

    public byte[] createAndDownloadDocument(Long documentId, String extractedText) throws Exception {
        Document document = documentRepository.findById(documentId)
            .orElseThrow(() -> new RuntimeException("문서를 찾을 수 없습니다: " + documentId));

        // 1. 새로운 XWPFDocument 객체 생성 (빈 DOCX 파일을 만듭니다)
        try (XWPFDocument newDoc = new XWPFDocument()) {
            // 2. 새로운 단락(paragraph) 생성
            XWPFParagraph paragraph = newDoc.createParagraph();

            // 3. 단락에 텍스트 추가
            XWPFRun run = paragraph.createRun();
            run.setText(extractedText);
            run.setFontFamily("맑은 고딕"); // 글꼴 설정 (필요시)
            run.setFontSize(11);          // 글꼴 크기 설정 (필요시)

            // 4. ByteArrayOutputStream을 사용하여 수정된 문서를 byte[]로 변환
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            newDoc.write(bos);

            return bos.toByteArray();

        } catch (IOException e) {
            log.error("DOCX 파일 생성 중 오류 발생", e);
            throw new RuntimeException("DOCX 파일 생성 실패", e);
        }
    }
    public byte[] finalLogic(String extractedText, MultipartFile document)throws IOException, InterruptedException{
        // Docx를 Markdown으로 변경
        String markdownContentBefore = convertDocxToMarkdown(document);
        // Markdown을 JSON으로 변경
        String jsonBefore = geminiService.makeJsonBefore(markdownContentBefore);
        // JSON을 완성된 JSON으로 변경
        String jsonAfter = gptService.generateResponse(jsonBefore, extractedText);
        //
        String makeMarkDownResult = geminiService.makeJsonToMarkDown(markdownContentBefore, jsonAfter);
        return convertMarkdownToDocx(makeMarkDownResult);
    }
}
