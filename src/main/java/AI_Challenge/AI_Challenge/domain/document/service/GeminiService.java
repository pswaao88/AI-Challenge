package AI_Challenge.AI_Challenge.domain.document.service;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
public class GeminiService {

    private final GptService gptService;

    public GeminiService(GptService gptService) {
        this.gptService = gptService;
    }

    public String extractTextFromImageByGemini(MultipartFile image) {
        try {
            Client client = new Client();

            // 이미지 파일을 바이트 배열로 변환
            byte[] imageBytes = image.getBytes();

            // Content 객체 생성
            Content content = Content.fromParts(
                Part.fromText("이미지에서 텍스트를 추출하고 깔끔하게 정리해주세요. 추출된 텍스트를 기반으로 문서를 작성해주세요."),
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

    public String makeJsonBefore(String markdownContentBefore) {
        try {
            Client client = new Client();
            String markdownTemplate = """
                **여 비 정 산 신 청 서**
                
                <table>
                <colgroup>
                <col style="width: 12%" />
                <col style="width: 11%" />
                <col style="width: 9%" />
                <col style="width: 17%" />
                <col style="width: 8%" />
                <col style="width: 0%" />
                <col style="width: 8%" />
                <col style="width: 6%" />
                <col style="width: 1%" />
                <col style="width: 8%" />
                <col style="width: 5%" />
                <col style="width: 10%" />
                </colgroup>
                <tbody>
                <tr>
                <td style="text-align: center;"><strong>소 속</strong></td>
                <td colspan="3"
                style="text-align: center;"><strong>컴퓨터공학과</strong></td>
                <td style="text-align: center;"><strong>직 급</strong></td>
                <td colspan="4"
                style="text-align: center;"><strong>석사과정</strong></td>
                <td style="text-align: center;"><strong>성 명</strong></td>
                <td colspan="2" style="text-align: center;"><strong>정다혜</strong></td>
                </tr>
                <tr>
                <td rowspan="2"
                style="text-align: center;"><strong>출장일정</strong></td>
                <td style="text-align: center;"><strong>일 시</strong></td>
                <td colspan="10" style="text-align: center;">{{일시}}</td>
                </tr>
                <tr>
                <td style="text-align: center;"><strong>출장지</strong></td>
                <td colspan="10" style="text-align: center;">{{출장지}}</td>
                </tr>
                <tr>
                <td style="text-align: center;"><strong>식 비</strong></td>
                <td style="text-align: center;"><strong>기 간</strong></td>
                <td colspan="2" style="text-align: center;">{{식비기간}}</td>
                <td colspan="3"
                style="text-align: center;"><strong>식사제공횟수</strong></td>
                <td style="text-align: center;">{{식사제공횟수}}</td>
                <td colspan="3"
                style="text-align: center;"><strong>식비정산금</strong></td>
                <td style="text-align: right;">{{식비정산금}}</td>
                </tr>
                <tr>
                <td rowspan="2" style="text-align: center;"><strong>숙 박
                비</strong></td>
                <td colspan="2"
                style="text-align: center;"><strong>시작일자</strong></td>
                <td style="text-align: center;"><strong>종료일자</strong></td>
                <td colspan="4"
                style="text-align: center;"><strong>급지등급</strong></td>
                <td colspan="4" style="text-align: center;"><strong>금액</strong></td>
                </tr>
                <tr>
                <td colspan="2" style="text-align: center;">{{숙박시작일자}}</td>
                <td style="text-align: center;">{{숙박종료일자}}</td>
                <td colspan="4" style="text-align: center;"><em>그 밖의 지역</em></td>
                <td colspan="4" style="text-align: right;">{숙박비금액}}</td>
                </tr>
                <tr>
                <td rowspan="5" style="text-align: center;"><strong>운 임</strong></td>
                <td style="text-align: center;"><strong>일 자</strong></td>
                <td style="text-align: center;"><strong>교통편</strong></td>
                <td style="text-align: center;"><strong>출발지</strong></td>
                <td colspan="2" style="text-align: center;"><strong>도착지</strong></td>
                <td colspan="2" style="text-align: center;"><strong>구분</strong></td>
                <td colspan="4" style="text-align: center;"><strong>금액</strong></td>
                </tr>
                <tr>
                <td style="text-align: center;">{{일자1}}</td>
                <td style="text-align: center;">{{교통편1}}</td>
                <td style="text-align: center;">{{출발지1}}</td>
                <td colspan="2" style="text-align: center;">{{도착지1}}</td>
                <td colspan="2" style="text-align: center;"><em>{{구분1}}</em></td>
                <td colspan="4" style="text-align: right;">{{금액1}}</td>
                </tr>
                <tr>
                <td style="text-align: center;">{{일자2}}</td>
                <td style="text-align: center;">{{교통편2}}</td>
                <td style="text-align: center;">{{출발지2}}</td>
                <td colspan="2" style="text-align: center;">{{도착지2}}</td>
                <td colspan="2" style="text-align: center;"><em>{{구분2}}</em></td>
                <td colspan="4" style="text-align: right;">{{금액2}}</td>
                </tr>
                <tr>
                <td style="text-align: center;">{{일자3}}</td>
                <td style="text-align: center;">{{교통편3}}</td>
                <td style="text-align: center;">{{출발지3}}</td>
                <td colspan="2" style="text-align: center;">{{도착지3}}</td>
                <td colspan="2" style="text-align: center;"><em>{{구분3}}</em></td>
                <td colspan="4" style="text-align: right;">{{금액3}}</td>
                </tr>
                <tr>
                <td style="text-align: center;">{{일자4}}</td>
                <td style="text-align: center;">{{교통편4}}</td>
                <td style="text-align: center;">{{출발지4}}</td>
                <td colspan="2" style="text-align: center;">{{도착지4}}</td>
                <td colspan="2" style="text-align: center;"><em>{{구분4}}</em></td>
                <td colspan="4" style="text-align: right;">{{금액4}}</td>
                </tr>
                <tr>
                <td style="text-align: center;"><p><strong>출장금액</strong></p>
                <p><strong>(합계)</strong></p></td>
                <td colspan="5"
                style="text-align: right;"><strong>{{</strong>출장금액<strong>}}</strong></td>
                <td colspan="2"
                style="text-align: center;"><strong>예산항목</strong></td>
                <td colspan="4" style="text-align: center;">국내여비</td>
                </tr>
                <tr>
                <td style="text-align: center;"><strong>비 고</strong></td>
                <td colspan="11" style="text-align: center;">※ 공무원 여비규정을
                준용함</td>
                </tr>
                <tr>
                <td colspan="12" style="text-align: center;"><p><strong>관계서류를
                첨부하여 위와 같이 여비의 정산을 신청합니다.</strong></p>
                <p>2024년 월 일</p></td>
                </tr>
                </tbody>
                </table>
                
                **대전·세종·충남 지역혁신 플랫폼 총괄운영센터장 귀하**
                

                """;
            String jsonTemplate = """
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
                
            """;
            String prompt = String.format("""
            너는 주어진 gfm 문서를 분석하여, 문서의 내용을 '분석할 JSON 양식'에 맞춰 추출하는 전문가야.
            
            다음 지침을 반드시 따라줘:
            1. ＇입력 gfm텍스트’의 내용 중 {{ }} 이렇게 쌓여있는 값을 key값으로 가져가고 value 값을 빈 문자열로(“”)로 json으로 만들어줘
            2. 너의 답변은 오직 완성된 JSON 객체여야만 해. 다른 설명이나 인사말, 코드 블록 마크다운(```json)을 절대 포함하지 마.
                
            ---
            [예시 gfm 텍스트]
            %s
            ---
            [JSON 예시]
            %s
            ---
            [입력 gfm 텍스트]
            %s
        """,markdownTemplate ,jsonTemplate, markdownContentBefore);

            // Content 객체 생성
            Content content = Content.fromParts(
                Part.fromText(prompt)
            );

            // API 호출
            GenerateContentResponse response = client.models.generateContent(
                "gemini-2.5-flash-lite",
                content,
                null
            );

            return response.text();

        } catch (Exception e) {
            throw new RuntimeException("이미지 처리 중 오류가 발생했습니다.", e);
        }
    }

}
