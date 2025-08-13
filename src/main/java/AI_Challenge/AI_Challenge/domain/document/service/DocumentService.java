package AI_Challenge.AI_Challenge.domain.document.service;

import AI_Challenge.AI_Challenge.domain.document.entity.Document;
import AI_Challenge.AI_Challenge.domain.document.repository.DocumentRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;

import java.nio.charset.StandardCharsets;
import java.util.Iterator;
import java.util.Map.Entry;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableCell;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
    public String convertDocxToMarkdown(Document document) throws IOException, InterruptedException {
        // 1. Document 엔티티로부터 byte[] 콘텐츠를 가져옵니다.
        byte[] docxContent = document.getContent();

        // 2. byte[]를 임시 DOCX 파일로 생성합니다.
        Path tempInputFile = Files.createTempFile("input_", ".docx");
        Files.write(tempInputFile, docxContent);

        log.info("DOCX를 마크다운으로 변환 시작: {}", tempInputFile);

        String markdownContent;
        try {
            // 3. Pandoc 명령어 실행 준비 (이 부분은 기존과 동일합니다)
            ProcessBuilder processBuilder = new ProcessBuilder(
                "pandoc",
                "-f", "docx",      // 입력 포맷: docx
                "-t", "gfm",       // 출력 포맷: GitHub Flavored Markdown
                tempInputFile.toAbsolutePath().toString()
            );

            // 4. Pandoc 실행 및 결과 읽기
            Process process = processBuilder.start();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                StringBuilder result = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    result.append(line).append("\n");
                }
                markdownContent = result.toString();
            }

            // 5. 프로세스 에러 처리
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                String errorOutput = new String(process.getErrorStream().readAllBytes(), StandardCharsets.UTF_8);
                log.error("Pandoc 실행 오류 (Exit code: {}): {}", exitCode, errorOutput);
                throw new RuntimeException("DOCX를 Markdown으로 변환하는 데 실패했습니다.");
            }
        } finally {
            // 6. 사용이 끝난 임시 파일 삭제
            Files.deleteIfExists(tempInputFile);
            log.info("임시 파일 삭제 완료: {}", tempInputFile);
        }
        return markdownContent;
    }

    @Transactional(readOnly = true)
    public byte[] getTemplateContentById(Long documentId) {
        // 1. ID를 사용해 데이터베이스에서 Document 엔티티를 찾습니다.
        Document document = documentRepository.findById(documentId)
            .orElseThrow(() -> new RuntimeException("문서를 찾을 수 없습니다: " + documentId));

        // 2. 엔티티가 가지고 있는 content 필드(byte[])를 직접 반환합니다.
        //    파일 시스템을 전혀 참조할 필요가 없습니다.
        return document.getContent();
    }

    @Transactional(readOnly = true)
    public Optional<Document> findDocumentByName(String fileName) {
        // Repository를 사용해 파일 이름으로 문서를 찾습니다.
        return documentRepository.findByFileName(fileName);
    }

    // json 내용 채우기
    @Transactional(readOnly = true)
    public byte[] fillDocxTemplateWithJson(String extractedText, Long documentId) throws IOException, InterruptedException {
        Document document = documentRepository.findById(documentId)
            .orElseThrow(() -> new RuntimeException("문서를 찾을 수 없습니다. ID: " + documentId));        // Docx를 Markdown으로 변경

        String markdownContentBefore = convertDocxToMarkdown(document);
        // Markdown을 JSON으로 변경
        String jsonBefore = geminiService.makeJsonBefore(markdownContentBefore);
        System.out.println("JsonBefore: " + jsonBefore);
        // JSON을 완성된 JSON으로 변경
        String jsonAfter = gptService.generateResponse(jsonBefore, extractedText)
            .replaceAll("(?i)```json", "")
            .replace("```", "")
            .trim();;
        System.out.println("JsonAfter: " + jsonAfter);
        // 1. DB에서 원본 템플릿 문서를 찾습니다.
        Document templateDocument = documentRepository.findById(documentId)
            .orElseThrow(() -> new RuntimeException("문서를 찾을 수 없습니다: " + documentId));

        // 2. 문서의 원본 내용(byte[])을 InputStream으로 변환합니다.
        InputStream templateInputStream = new ByteArrayInputStream(templateDocument.getContent());

        // 3. JSON을 평탄화된 Map으로 변환합니다.
        Map<String, String> dataMap = flattenJsonToMap(jsonAfter);
        System.out.println("dataMap: " + dataMap);

        try (XWPFDocument doc = new XWPFDocument(templateInputStream)) {
            // 일반 문단 교체: 문서 전체의 문단을 순회하며 교체
            for (XWPFParagraph p : doc.getParagraphs()) {
                replacePlaceholdersInParagraph(p, dataMap);
            }

            // 표 안의 내용 교체: 표를 순회하며 텍스트를 교체
            for (XWPFTable table : doc.getTables()) {
                for (XWPFTableRow row : table.getRows()) {
                    for (XWPFTableCell cell : row.getTableCells()) {
                        for (XWPFParagraph p : cell.getParagraphs()) {
                            replacePlaceholdersInParagraph(p, dataMap);
                        }
                    }
                }
            }

            // 5. 수정된 문서를 byte 배열로 변환하여 반환
            try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                doc.write(baos);
                log.info("DOCX 템플릿 채우기 완료. 문서 ID: {}", documentId);
                return baos.toByteArray();
            }
        }
    }

    /**
     * 중첩된 JSON을 평탄한 Map으로 변환
     */
    public Map<String, String> flattenJsonToMap(String jsonString) {
        Map<String, String> dataMap = new HashMap<>();
        ObjectMapper objectMapper = new ObjectMapper();

        try {
            JsonNode rootNode = objectMapper.readTree(jsonString);
            flattenNodeWithLabel(rootNode, dataMap);
        } catch (JsonProcessingException e) {
            log.error("JSON 파싱 에러", e);
        }
        return dataMap;
    }

    private void flattenNodeWithLabel(JsonNode node, Map<String, String> map) {
        if (node.isObject()) {
            if (node.has("label") && node.has("value")) {
                // "label"과 "value"를 가진 객체는 key-value로 직접 추가
                map.put(node.get("label").asText(), node.get("value").asText());
            } else {
                Iterator<Map.Entry<String, JsonNode>> fields = node.fields();
                while (fields.hasNext()) {
                    Map.Entry<String, JsonNode> field = fields.next();
                    // 최상위 레벨의 title, recipient 등을 처리
                    if (field.getValue().isTextual()) {
                        map.put(field.getKey(), field.getValue().asText());
                    } else {
                        flattenNodeWithLabel(field.getValue(), map);
                    }
                }
            }
        } else if (node.isArray()) {
            for (JsonNode arrayElement : node) {
                flattenNodeWithLabel(arrayElement, map);
            }
        }
    }

    /**
     * [신규] 재귀적으로 Map을 순회하며 키를 평탄화하는 private 헬퍼 메서드입니다.
     */
    @SuppressWarnings("unchecked")
    private void flattenRecursively(Map<String, String> flattenedMap, Map<String, Object> jsonMap, String prefix) {
        for (Map.Entry<String, Object> entry : jsonMap.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            String newPrefix = prefix.isEmpty() ? key : prefix + "." + key;

            if (value instanceof Map) {
                flattenRecursively(flattenedMap, (Map<String, Object>) value, newPrefix);
            } else if (value instanceof List) {
                List<?> list = (List<?>) value;
                Map<String, Integer> duplicateLabelCounter = new HashMap<>();
                for (Object item : list) {
                    if (item instanceof Map) {
                        Map<String, Object> itemMap = (Map<String, Object>) item;
                        String label = (String) itemMap.get("label"); // 'label'을 기준으로 고유 키 생성
                        int count = duplicateLabelCounter.getOrDefault(label, 0);
                        String uniquePrefix = newPrefix + "[" + count + "]"; // 예: table.운임[0]
                        if(label != null && !label.isEmpty()){
                            uniquePrefix = newPrefix + "." + label + "[" + count + "]";
                        }
                        duplicateLabelCounter.put(label, count + 1);
                        flattenRecursively(flattenedMap, itemMap, uniquePrefix);
                    }
                }
            } else if (value != null) {
                flattenedMap.put(newPrefix, value.toString());
            }
        }
    }

    /**
     * [신규] 문단 내의 자리 표시자를 교체하는 private 헬퍼 메서드입니다.
     */
    private void replacePlaceholdersInParagraph(XWPFParagraph paragraph, Map<String, String> data) {
        // 1. 문단 전체의 텍스트를 하나로 합칩니다.
        StringBuilder fullTextBuilder = new StringBuilder();
        for (XWPFRun run : paragraph.getRuns()) {
            if (run.getText(0) != null) {
                fullTextBuilder.append(run.getText(0));
            }
        }
        String fullText = fullTextBuilder.toString();

        // 2. 플레이스홀더가 없으면 바로 반환합니다.
        if (fullText == null || !fullText.contains("{{") || !fullText.contains("}}")) {
            return;
        }

        // 3. 정규식을 이용해 플레이스홀더를 찾아 교체합니다.
        String replacedText = fullText;
        Pattern pattern = Pattern.compile("\\{\\{([^}]+)\\}\\}");
        Matcher matcher = pattern.matcher(fullText);

        while (matcher.find()) {
            String placeholderKey = matcher.group(1).trim();
            // dataMap에서 키를 찾아 값을 교체
            if (data.containsKey(placeholderKey)) {
                String value = data.get(placeholderKey);
                replacedText = replacedText.replace("{{" + placeholderKey + "}}", value);
            }
        }

        // 4. 변경된 내용이 있을 때만 Run을 재구성합니다.
        if (!fullText.equals(replacedText)) {
            while (!paragraph.getRuns().isEmpty()) {
                paragraph.removeRun(0);
            }
            XWPFRun newRun = paragraph.createRun();
            newRun.setText(replacedText);
        }
    }
}
