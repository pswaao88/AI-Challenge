package AI_Challenge.AI_Challenge.domain.document.service;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import java.nio.file.Files;
import java.nio.file.Path;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GenimiService {

    public String connectGenimi() {
        try {
            Client client = new Client();

            // 이미지 파일 읽기
            byte[] imageBytes = Files.readAllBytes(Path.of(
                "D:\\project\\generated_AI_Challenge\\AI-Challenge\\image\\KakaoTalk_20250723_185022746.jpg"));

            // Content 객체 생성
            Content content = Content.fromParts(
                Part.fromText("이미지에서 모든 텍스트를 추출하고 깔끔하게 정렬해주세요."),
                Part.fromBytes(imageBytes, "image/jpeg")
            );

            // API 호출
            GenerateContentResponse response = client.models.generateContent(
                "gemini-2.5-flash-lite",
                content,
                null
            );

            // 결과 출력
            System.out.println(response.text());
            return response.text();

        } catch (Exception e) {
            System.err.println("에러 발생: " + e.getMessage());
            e.printStackTrace();
            return null;
        }

    }

}
