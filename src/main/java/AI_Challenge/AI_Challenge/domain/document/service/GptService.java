package AI_Challenge.AI_Challenge.domain.document.service;

import com.theokanning.openai.OpenAiHttpException;
import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatCompletionResult;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.service.OpenAiService;

import java.util.Arrays;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class GptService {

    private final OpenAiService openAiService;

    public GptService(@Value("${openai.api.key}") String apiKey) {
        this.openAiService = new OpenAiService(apiKey);
    }

    public String generateResponse(String prompt) {

        try {
            ChatCompletionRequest request = ChatCompletionRequest.builder()
                .model("gpt-5-mini")
                .messages(Arrays.asList(
                    new ChatMessage("user", prompt)
                ))
                .maxTokens(128)
                .temperature(0.7)
                .n(1)
                .build();

            ChatCompletionResult response = openAiService.createChatCompletion(request);

            return response.getChoices().get(0).getMessage().getContent();
        } catch (OpenAiHttpException e) {
            if (e.getMessage().contains("quota")) {
                log.error("쿼터 초과 에러 발생", e);
                throw new RuntimeException("API 할당량 초과로 요청을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.", e);
            } else {
                log.error("GPT API 호출 중 오류 발생", e);
                throw new RuntimeException("GPT 응답 생성 실패", e);
            }
        }

    }
}
