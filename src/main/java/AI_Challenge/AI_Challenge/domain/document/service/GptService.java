package AI_Challenge.AI_Challenge.domain.document.service;

import com.theokanning.openai.OpenAiHttpException;
import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatCompletionResult;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.service.OpenAiService;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
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

    public String generateResponse(String inputJson, String inputText) {
        String prompt = String.format("""
            역할(Role):
            당신은 영수증에서 추출된 텍스트를 정확하게 이해하고, 제공된 JSON 형식의 문서 양식에 필요한 정보를 정확히 채워 넣는 전문적인 문서 처리 및 데이터 추출 AI입니다.
        
            태스크(Task):
            사용자가 제공하는 '영수증 텍스트'를 분석하여, '문서 양식 JSON'에 명시된 각 필드의 'value' 값을 채워야 합니다. 모든 'value' 필드를 채울 필요는 없으며, 영수증 텍스트에서 명확하게 파악할 수 있는 정보만 채워 넣으세요.
            특히 날짜, 시간, 금액, 장소, 항목 등 구체적인 정보를 정확히 매핑해야 합니다.
        
            룰(pos) - 긍정 규칙:
            1.  **정확성 유지:** 영수증 텍스트에 있는 정보만 사용하여 'value' 필드를 채우세요. 영수증에 없는 정보는 빈 문자열("")로 남겨두세요.
            2.  **JSON 형식 유지:** 최종 결과물은 원본 '문서 양식 JSON'의 전체 구조와 모든 키(key)를 그대로 유지해야 합니다. 'value' 필드만 수정하세요.
            3.  **데이터 타입 유지:** 금액은 "원" 단위를 포함하여 텍스트 그대로, 날짜는 "YYYY년 MM월 DD일" 형식으로 추출하는 등, 원본 텍스트의 형식에 가깝게 유지하세요.
            4.  **세부 정보 매핑:** '출장일정', '식비', '운임' 등 각 섹션 내의 하위 필드('일시', '식비정산금', '유류비' 등)를 영수증 텍스트에서 찾아 정확히 매핑하세요.
            5.  **불확실성 처리:** 정보가 불확실하거나 여러 개의 정보가 있을 경우, 가장 명확한 정보 하나만 선택하거나, 아니면 해당 'value' 필드를 비워두세요.
        
            룰(neg) - 부정 규칙:
            1.  **추측 금지:** 영수증에 명시적으로 없는 정보는 절대로 추측하여 'value' 필드를 채우지 마세요.
            2.  **주관적인 판단 금지:** 어떠한 주관적인 판단, 설명, 요약 또는 추가적인 텍스트를 결과 JSON에 포함하지 마세요. 오직 데이터를 채우세요.
            3.  **JSON 구조 변경 금지:** JSON의 키(key) 이름, 객체 구조, 배열 순서 등을 절대 변경하지 마세요.
            4.  **대화 금지:** 응답은 오직 채워진 JSON 데이터여야 합니다. 어떠한 형태의 대화나 설명도 포함하지 마세요.
        
            (few-shot) - 예시:
            [Input]
            영수증 텍스트: "2024년 7월 10일 14:30, 스타벅스 강남점, 아메리카노 5,000원, 결제카드: 현대카드"
            문서 양식 JSON:
            ```json
            {
              "title": "여비 정산 신청서",
              "recipient": "대전·세종·충남 지역혁신 플랫폼 총괄운영센터장 귀하",
              "table": [
                {
                  "label": "소속",
                  "value": ""
                },
                {
                  "label": "출장일정",
                  "items": [
                    {
                      "label": "일시",
                      "value": ""
                    },
                    {
                      "label": "출장지",
                      "value": ""
                    }
                  ]
                },
                {
                  "label": "식비",
                  "items": [
                    {
                      "label": "식사제공횟수",
                      "value": "0회"
                    },
                    {
                      "label": "식비정산금",
                      "value": "0원"
                    }
                  ]
                },
                {
                  "label": "계좌번호",
                  "value": ""
                },
                {
                  "label": "은행",
                  "value": ""
                }
              ]
            }
            ‘
            [output]
            {
              "title": "여비 정산 신청서",
              "recipient": "대전·세종·충남 지역혁신 플랫폼 총괄운영센터장 귀하",
              "table": [
                {
                  "label": "소속",
                  "value": ""
                },
                {
                  "label": "출장일정",
                  "items": [
                    {
                      "label": "일시",
                      "value": "2024년 7월 10일"
                    },
                    {
                      "label": "출장지",
                      "value": "스타벅스 강남점"
                    }
                  ]
                },
                {
                  "label": "식비",
                  "items": [
                    {
                      "label": "식사제공횟수",
                      "value": "1회"
                    },
                    {
                      "label": "식비정산금",
                      "value": "5,000원"
                    }
                  ]
                },
                {
                  "label": "계좌번호",
                  "value": ""
                },
                {
                  "label": "은행",
                  "value": ""
                }
              ]
            }
        
            중요정보 한번 더 상기:
            제공된 영수증 텍스트에서 명확한 정보만을 사용하여 '문서 양식 JSON'의 각 필드에 해당하는 'value'를 채우고, 채워진 JSON 객체만을 응답으로 반환해야 합니다. JSON 구조는 절대 변경하지 마세요.
        
            ---
            [입력 JSON]
            %s
            ---
            [입력 텍스트]
            %s
            ---
        """, inputJson, inputText);

        try {
            ChatCompletionRequest request = ChatCompletionRequest.builder()
                .model("gpt-4.1")
                .messages(Arrays.asList(
                    new ChatMessage("user", prompt)
                ))
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
