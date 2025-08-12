package AI_Challenge.AI_Challenge.domain.document.controller;

import AI_Challenge.AI_Challenge.domain.document.service.GeminiService;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/api/gemini")
@Slf4j
public class GeminiController {
    private final GeminiService geminiService;

    @Autowired
    public GeminiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/generate/images")
    public ResponseEntity<List<Map<String, String>>> generateResponseFromImages(
        @RequestParam("images") List<MultipartFile> images) {
        try {
            List<Map<String, String>> responses = new ArrayList<>();

            for (MultipartFile image : images) {
                String response = geminiService.extractTextFromImageByGemini(image);
                Map<String, String> responseMap = new HashMap<>();
                responseMap.put("fileName", image.getOriginalFilename());
                responseMap.put("response", response);
                responses.add(responseMap);
            }

            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            log.error("이미지 처리 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(List.of(Map.of("error", "이미지 처리 실패")));
        }

    }
    @PostMapping("/generate/files")
    public ResponseEntity<List<Map<String, String>>> generateResponseFromFiles(
        @RequestParam Map<String, String> request,
        @RequestParam("documents") List<MultipartFile> documents) {
        return generateResponseFromImages(documents);

    }
    @PostMapping("/generate/test/files")
    public ResponseEntity<String> testGenerateResponseFromFiles(
        @RequestParam("document") MultipartFile document) {
        return ResponseEntity.ok(geminiService.extractTextFromDocByGemini(document));
    }
}
