package AI_Challenge.AI_Challenge.domain.document.service;

import com.theokanning.openai.OpenAiHttpException;
import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatCompletionResult;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.service.OpenAiService;

import java.time.Duration;
import java.util.Arrays;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;


@Service
@Slf4j
public class GptService {

    private final OpenAiService openAiService;

    public GptService(@Value("${openai.api.key}") String apiKey) {
        this.openAiService = new OpenAiService(apiKey, Duration.ofSeconds(60));
    }

    public String generateResponse(String inputJson, String inputText) {
        String prompt = String.format("""
            역할(Role):
            당신은 영수증에서 추출된 텍스트를 정확하게 이해하고, 제공된 JSON 형식의 문서 양식에 필요한 정보를 정확히 채워 넣는 전문적인 문서 처리 및 데이터 추출 AI입니다.
        
            태스크(Task):
            사용자가 제공하는 '영수증 텍스트'를 분석하여, '문서 양식 JSON'에 명시된 각 필드의 'value' 값을 채워야 합니다. 모든 'value' 필드를 채울 필요는 없으며, 영수증 텍스트에서 명확하게 파악할 수 있는 정보만 채워 넣으세요.
            특히 날짜, 시간, 금액, 장소, 항목 등 구체적인 정보를 정확히 매핑해야 합니다. 채워 넣은 부분의 필드와 value만 남기세요.
        
            룰(pos) - 긍정 규칙:
            1.  **정확성 유지:** 영수증 텍스트에 있는 정보만 사용하여 'value' 필드를 채우세요. 영수증에 없는 정보는 빈 문자열("")로 남겨두세요.
            2.  **JSON 형식 유지:** 최종 결과물은 원본 '문서 양식 JSON'의 전체 구조와 모든 키(key)를 그대로 유지해야 합니다. 'value' 필드만 수정하세요.
            3.  **데이터 타입 유지:** 금액은 "원" 단위를 포함하여 텍스트 그대로, 날짜는 "YYYY년 MM월 DD일" 형식으로 추출하는 등, 원본 텍스트의 형식에 가깝게 유지하세요.
            4.  **세부 정보 매핑:** '출장일정', '식비', '운임' 등 각 섹션 내의 하위 필드('일시', '식비정산금', '유류비' 등)를 영수증 텍스트에서 찾아 정확히 매핑하세요.
            5.  **불확실성 처리:** 정보가 불확실하거나 여러 개의 정보가 있을 경우, 가장 명확한 정보 하나만 선택하거나, 아니면 해당 'value' 필드를 비워두세요.
            6.  출장금액은 모든 금액(식비정산금, 숙박비금액, 금액1, 금액2, 금액3, 금액4)를 모두 더한 값입니다. 임의로 바꾸지 않고 입력된 텍스트의 값을 그대로 쓰세요. 
            7.  value에 대응되는 값이 없는 key의 value를 빈문자열로 ("") 로 수정하세요.
        
            룰(neg) - 부정 규칙:
            1.  **추측 금지:** 영수증에 명시적으로 없는 정보는 절대로 추측하여 'value' 필드를 채우지 마세요.
            2.  **주관적인 판단 금지:** 어떠한 주관적인 판단, 설명, 요약 또는 추가적인 텍스트를 결과 JSON에 포함하지 마세요. 오직 데이터를 채우세요.
            3.  식사제공횟수는 식비와 관련된 영수증의 개수로 채우세요.
            4.  교툥편은 "버스", "기차", "비행기"의 값으로만 채우세요. 구분도 같은 값으로 채우세요.
            5.  **JSON 구조 변경 금지:** JSON의 키(key) 이름, 객체 구조, 배열 순서 등을 절대 변경하지 마세요.
            6.  **대화 금지:** 응답은 오직 채워진 JSON 데이터여야 합니다. 어떠한 형태의 대화나 설명도 포함하지 마세요.
        
            (few-shot) - 예시:
            [Input]
            [
                    {
                        "fileName": "bus.png",
                        "response": "## 고속버스 영수증 (네이버페이)\\n\\n**상호:** 금호익스프레스(주)\\n**사업자 번호:** 899-87-02113\\n\\n---\\n\\n**카드사:** 외환\\n**카드번호:** 53275073****459*\\n**승인번호:** 14605907\\n**승인일자:** 2025.04.17\\n**승인시간:** 17:39:24\\n**승인금액:** 16,900원\\n**환불금액:** 0원\\n**취소수수료:** 0원\\n**결제금액:** 16,900원 (부가세포함)\\n\\n---\\n\\n**출발일:** 2025.04.25\\n**출발지:** 유성\\n**도착지:** 센트럴시티(서울)\\n**출발시간:** 13:15\\n**버스등급:** 우등\\n**일반매수:** 일반1명\\n\\n**※ 영수증은 승차권이 아닙니다. 이 영수증으로 승차권을 대신하여 탑승하실 수 없습니다.**"
                    },
                    {
                        "fileName": "plane.pdf",
                        "response": "## 항공권 온라인 매출전표\\n\\n**카드 정보**\\n\\n*   **카드 종류/CARD TYPE:** 신한카드\\n*   **카드 번호/CARD No.:** \\\\*\\\\*\\\\*\\\\* \\\\*\\\\*\\\\*\\\\* \\\\*\\\\*\\\\*\\\\* -7837\\n*   **유효 기간/EXPIRY:** 구매자명/PURCHASER: \\\\*\\\\*\\\\*\\\\*\\n*   **손유지/:** \\\\*\\\\*\\/\\\\*\\\\*\\n*   **거래 일시/TRANS.DATE:** 2025-06-13\\n*   **상품명/ITEM:** 항공권\\n*   **예약 번호:** 항공 여정\\n*   **R57X67:** 청주 - 제주\\n*   **거래 유형/TYPE:** 승인 번호/APPROVAL NO.: 29970957\\n*   **할부/INSTALLMENT:** 카드\\n*   **일시불:** 29970957\\n*   **금액:** 62,500원\\n*   **부가세:** 0원\\n*   **합계:** 62,500원\\n\\n---\\n\\n**가맹점 정보**\\n\\n*   **업체명/BUSINESS STATUS:** 진에어\\n*   **대표자명/REPRESENTATIVE:** 최정호\\n*   **사업자 등록 번호/RESISTRATION No.:** 1218189086\\n*   **연락처/TEL:** 1600-6200\\n*   **주소/ADDRESS:** 서울시 강서구 공항대로 453\\n\\n---\\n\\n**공급자 정보**\\n\\n*   **업체명/BUSINESS STATUS:** 마이리얼트립\\n*   **대표자명/REPRESENTATIVE:** 이동건\\n*   **사업자 등록 번호/RESISTRATION No.:** 209-81-55339\\n*   **연락처/TEL:** 1670-8208\\n*   **주소/ADDRESS:** 서울특별시 서초구 강남대로 311 드림플러스 강남 18, 19층 (주)마이리얼트립"
                    },
                    {
                        "fileName": "train.png",
                        "response": "## 승차권 정보\\n\\n**승차권 번호:** 82121-0122-12073-69\\n**발행일시:** 2025년 01월 22일 11:10:13\\n\\n---\\n\\n### 영수증\\n\\n**2025년 1월 22일(수)**\\n\\n*   **열차:** KTX 105 | 일반실 | 6호차 8D\\n*   **경로:** 서울 17:13 〉 대전 18:12\\n*   **인원:** 어른 1매, 어린이 0매 | **할인:** 0명 | 전환 할인\\n\\n---\\n\\n**결제 방식:** 토스머니(대구은행)\\n**카드 번호:** (일시불)\\n**승인 일자:** 20250117\\n**승인 번호:** 89-856c-61f0db10f267\\n**결제 금액:** 22,500원\\n**총 영수 금액:** 22,500원\\n\\n**사업자:** 한국철도공사 314-82-10024\\n\\n---\\n\\n[이메일 보내기]"
                    },
                    
                ]
            
            [Input 중요정보]
            
            "버스 텍스트2: 2025년 4월 25일 13:15, 유성 → 센트럴시티(서울), 고속버스, 16,900원, 결제카드: 외환"
            
            "기차 텍스트3: 2025년 1월 22일 17:13, 서울 → 대전, KTX 105 일반실, 22,500원, 결제수단: 토스머니(대구은행)"
            
            "비행기 텍스트4: 2025년 6월 13일, 청주 → 제주, 항공권, 62,500원, 결제카드: 신한카드"
            
            
            
            문서 양식 JSON:
            ```json
            {
                  "일시": "",
                  "출장지": "",
                  "식비기간": "",
                  "식사제공횟수": "",
                  "식비정산금": "",
                  "숙박시작일자": "",
                  "숙박종료일자": "",
                  "숙박비금액": "",
                  "일자1": "",
                  "교통편1": "",
                  "출발지1": "",
                  "도착지1": "",
                  "구분1": "",
                  "금액1": "",
                  "일자2": "",
                  "교통편2": "",
                  "출발지2": "",
                  "도착지2": "",
                  "구분2": "",
                  "금액2": "",
                  "일자3": "",
                  "교통편3": "",
                  "출발지3": "",
                  "도착지3": "",
                  "구분3": "",
                  "금액3": "",
                  "일자4": "",
                  "교통편4": "",
                  "출발지4": "",
                  "도착지4": "",
                  "구분4": "",
                  "금액4": "",
                  "출장금액": ""
            }
            ‘
            [output]
            {
                  "일시": "2024년 7월 10일 ~ 2024년 7월 11일",
                  "출장지": "제주(최종 목적지)",
                  "식비기간": "2025-07-23",
                  "식사제공횟수": "1",
                  "식비정산금": "53,700원",
                  "숙박시작일자": "2025-07-02",
                  "숙박종료일자": "2025-07-03",
                  "숙박비금액": "252,654원",
                  "일자1": "2025-04-25",
                  "교통편1": "버스",
                  "출발지1": "유성",
                  "도착지1": "센트럴시티(서울)",
                  "구분1": "버스",
                  "금액1": "16,900원",
                  "일자2": "2025-01-22",
                  "교통편2": "기차",
                  "출발지2": "서울",
                  "도착지2": "대전",
                  "구분2": "기차",
                  "금액2": "22,500원",
                  "일자3": "2025-06-13",
                  "교통편3": "비행기",
                  "출발지3": "청주",
                  "도착지3": "제주",
                  "구분3": "비행기",
                  "금액3": "62,500원",
                  "출장금액": "408,254원"
            }
            
        
            중요정보 한번 더 상기:
            제공된 영수증 텍스트에서 명확한 정보만을 사용하여 '문서 양식 JSON'의 각 필드에 해당하는 'value'를 채우고, 채워진 JSON 객체만을 응답으로 반환해야 합니다. JSON 구조는 절대 변경하지 마세요.
            코드 블록 마크다운(```json)을 절대 포함하지 마세요.
        
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
