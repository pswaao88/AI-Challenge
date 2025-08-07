package AI_Challenge.AI_Challenge.domain.document.service;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@RequiredArgsConstructor
public class GeminiService {

    public String extractTextFromImageByGemini(String prompt, MultipartFile image) {
        try {
            Client client = new Client();

            // 이미지 파일을 바이트 배열로 변환
            byte[] imageBytes = image.getBytes();

            // Content 객체 생성
            Content content = Content.fromParts(
                Part.fromText(prompt),
                Part.fromBytes(imageBytes, image.getContentType())
            );

            // API 호출
            GenerateContentResponse response = client.models.generateContent(
                "gemini-2.5-flash-lite",
                content,
                null
            );

            log.info("이미지 처리 완료: {}", image.getOriginalFilename());
            return response.text();

        } catch (Exception e) {
            log.error("이미지 처리 중 오류 발생: {}", image.getOriginalFilename(), e);
            throw new RuntimeException("이미지 처리 중 오류가 발생했습니다.", e);
        }
    }



}
