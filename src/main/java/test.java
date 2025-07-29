import AI_Challenge.AI_Challenge.domain.document.service.GptService;
import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatCompletionResult;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.service.OpenAiService;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import org.springframework.beans.factory.annotation.Value;

public class test {

    public static void main(String[] args) {
//        try {
//            Client client = new Client();
//
//            // 이미지 파일 읽기
//            byte[] imageBytes = Files.readAllBytes(Path.of("D:\\project\\generated_AI_Challenge\\AI-Challenge\\image\\KakaoTalk_20250723_185022746.jpg"));
//
//            // Content 객체 생성
//            Content content = Content.fromParts(
//                Part.fromText("이미지에서 모든 텍스트를 추출하고 깔끔하게 정렬해 docx파일로 만들어주세요."),
//                Part.fromBytes(imageBytes, "image/jpeg")
//            );
//
//            // API 호출
//            GenerateContentResponse response = client.models.generateContent(
//                "gemini-2.5-flash-lite",
//                content,
//                null
//            );
//
//            // 결과 출력
//            System.out.println(response.text());
//
//        } catch (Exception e) {
//            System.err.println("에러 발생: " + e.getMessage());
//            e.printStackTrace();
//        }

    }
}
