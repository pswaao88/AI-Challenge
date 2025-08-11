package AI_Challenge.AI_Challenge.domain.document.controller;

import AI_Challenge.AI_Challenge.domain.document.service.GptService;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/gpt")
@Slf4j
public class GptController {
    
    private final GptService gptService;
    @Autowired
    public GptController(GptService gptService) {
        this.gptService = gptService;
    }
    
//    @PostMapping("/generate")
//    public ResponseEntity<Map<String, String>> generateResponse(@RequestBody Map<String, String> request) {
//        try {
//            String prompt = request.get("prompt");
//            String response = gptService.generateResponse(prompt);
//
//            Map<String, String> responseBody = new HashMap<>();
//            responseBody.put("response", response);
//
//            return ResponseEntity.ok(responseBody);
//        } catch (Exception e) {
//            log.error("GPT 응답 생성 중 오류 발생", e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                .body(Map.of("error", "GPT 응답 생성 실패"));
//        }
//    }
    @PostMapping(value = "/generate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> convertToMarkdown(
        @RequestPart MultipartFile docxFile,
        @RequestPart String receiptText) throws IOException {

        String markdown = gptService.convertDocxToMarkdown(docxFile.getInputStream(), receiptText);
        return Map.of("markdown", markdown);
    }

}
