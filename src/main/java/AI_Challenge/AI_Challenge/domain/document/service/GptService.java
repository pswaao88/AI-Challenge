package AI_Challenge.AI_Challenge.domain.document.service;

import com.theokanning.openai.OpenAiHttpException;
import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatCompletionResult;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.service.OpenAiService;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.xwpf.usermodel.IBodyElement;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableCell;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;
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
                .model("gpt-4.1")
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

    public String convertDocxToMarkdown(InputStream docxInput, String receiptMarkdown) throws IOException {
        try (XWPFDocument document = new XWPFDocument(docxInput)) {
            StringBuilder md = new StringBuilder();
            for (IBodyElement element : document.getBodyElements()) {
                if (element instanceof XWPFParagraph) {
                    XWPFParagraph para = (XWPFParagraph) element;
                    String text = para.getText().trim();
                    if (!text.isEmpty()) {
                        md.append(text).append("\n\n");
                    }
                } else if (element instanceof XWPFTable) {
                    XWPFTable table = (XWPFTable) element;
                    for (XWPFTableRow row : table.getRows()) {
                        for (XWPFTableCell cell : row.getTableCells()) {
                            md.append(cell.getText()).append(" | ");
                        }
                        md.append("\n");
                    }
                    md.append("\n");
                }
            }
            // 원하는 위치에 영수증 Markdown 삽입
            md.append("\n## 첨부 영수증\n\n");
            md.append(receiptMarkdown).append("\n");

            return md.toString();
        }
    }


}
