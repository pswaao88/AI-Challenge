package AI_Challenge.AI_Challenge.domain.document.service;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import java.nio.charset.StandardCharsets;

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
                <td colspan="3" style="text-align: center;"></td>
                <td style="text-align: center;"><strong>직 급</strong></td>
                <td colspan="4" style="text-align: center;"></td>
                <td style="text-align: center;"><strong>성 명</strong></td>
                <td colspan="2" style="text-align: center;"></td>
                </tr>
                <tr>
                <td rowspan="2"
                style="text-align: center;"><strong>출장일정</strong></td>
                <td style="text-align: center;"><strong>일 시</strong></td>
                <td colspan="10" style="text-align: center;">2024년 월 일 ~ 20 년 월 일
                ( 박 일)</td>
                </tr>
                <tr>
                <td style="text-align: center;"><strong>출장지</strong></td>
                <td colspan="10" style="text-align: center;"></td>
                </tr>
                <tr>
                <td style="text-align: center;"><strong>식 비</strong></td>
                <td style="text-align: center;"><strong>기 간</strong></td>
                <td colspan="2" style="text-align: center;"></td>
                <td colspan="3"
                style="text-align: center;"><strong>식사제공횟수</strong></td>
                <td style="text-align: center;">0회</td>
                <td colspan="3"
                style="text-align: center;"><strong>식비정산금</strong></td>
                <td style="text-align: right;">0원</td>
                </tr>
                <tr>
                <td style="text-align: center;"><strong>일 비</strong></td>
                <td style="text-align: center;"><strong>기 간</strong></td>
                <td colspan="6" style="text-align: center;"></td>
                <td colspan="3"
                style="text-align: center;"><strong>일비정산금</strong></td>
                <td style="text-align: right;">원</td>
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
                <td colspan="2" style="text-align: center;"></td>
                <td style="text-align: center;"></td>
                <td colspan="4" style="text-align: center;"><em>그 밖의 지역</em></td>
                <td colspan="4" style="text-align: right;">원</td>
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
                <td style="text-align: center;"></td>
                <td style="text-align: center;"></td>
                <td style="text-align: center;"></td>
                <td colspan="2" style="text-align: center;"></td>
                <td colspan="2" style="text-align: center;"><em>유류비</em></td>
                <td colspan="4" style="text-align: right;">원</td>
                </tr>
                <tr>
                <td style="text-align: center;"></td>
                <td style="text-align: center;"></td>
                <td style="text-align: center;"></td>
                <td colspan="2" style="text-align: center;"></td>
                <td colspan="2" style="text-align: center;"><em>통행료</em></td>
                <td colspan="4" style="text-align: right;">원</td>
                </tr>
                <tr>
                <td style="text-align: center;"></td>
                <td style="text-align: center;"></td>
                <td style="text-align: center;"></td>
                <td colspan="2" style="text-align: center;"></td>
                <td colspan="2" style="text-align: center;"><em>승차권</em></td>
                <td colspan="4" style="text-align: right;">원</td>
                </tr>
                <tr>
                <td style="text-align: center;"></td>
                <td style="text-align: center;"></td>
                <td style="text-align: center;"></td>
                <td colspan="2" style="text-align: center;"></td>
                <td colspan="2" style="text-align: center;"></td>
                <td colspan="4" style="text-align: right;">원</td>
                </tr>
                <tr>
                <td style="text-align: center;"><p><strong>출장금액</strong></p>
                <p><strong>(합계)</strong></p></td>
                <td colspan="5" style="text-align: right;"><strong>원</strong></td>
                <td colspan="2"
                style="text-align: center;"><strong>예산항목</strong></td>
                <td colspan="4" style="text-align: center;">국내여비</td>
                </tr>
                <tr>
                <td style="text-align: center;"><strong>계좌번호</strong></td>
                <td colspan="5" style="text-align: center;"></td>
                <td colspan="2" style="text-align: center;"><strong>은 행</strong></td>
                <td colspan="4" style="text-align: center;"></td>
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
            """;

            String prompt = String.format("""
            너는 주어진 gfm 문서를 분석하여, 문서의 내용을 '분석할 JSON 양식'에 맞춰 추출하는 전문가야.
            
            다음 지침을 반드시 따라줘:
            1. '입력 gfm 텍스트'의 내용을 분석해서 '분석할 JSON 양식'의 비어있는 value 값을 모두 채워줘.
            2. 문서에 정보가 없는 항목은 빈 문자열("")로 남겨둬.
            3. 너의 답변은 오직 완성된 JSON 객체여야만 해. 다른 설명이나 인사말, 코드 블록 마크다운(```json)을 절대 포함하지 마.
            
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

    public String makeJsonToMarkDown(String markdownContentBefore, String jsonAfter) {
        try {
            Client client = new Client();


            String jsonResponseTemplate = """
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
            """;
            String resultMarkdown = """
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
                <td colspan="3" style="text-align: center;"></td>
                <td style="text-align: center;"><strong>직 급</strong></td>
                <td colspan="4" style="text-align: center;"></td>
                <td style="text-align: center;"><strong>성 명</strong></td>
                <td colspan="2" style="text-align: center;"></td>
                </tr>
                <tr>
                <td rowspan="2"
                style="text-align: center;"><strong>출장일정</strong></td>
                <td style="text-align: center;"><strong>일 시</strong></td>
                <td colspan="10" style="text-align: center;">2024년 7월 10일 ~ 2024년
                7월 10일 ( 박 일)</td>
                </tr>
                <tr>
                <td style="text-align: center;"><strong>출장지</strong></td>
                <td colspan="10" style="text-align: center;">스타벅스 강남점</td>
                </tr>
                <tr>
                <td style="text-align: center;"><strong>식 비</strong></td>
                <td style="text-align: center;"><strong>기 간</strong></td>
                <td colspan="2" style="text-align: center;"></td>
                <td colspan="3"
                style="text-align: center;"><strong>식사제공횟수</strong></td>
                <td style="text-align: center;">1회</td>
                <td colspan="3"
                style="text-align: center;"><strong>식비정산금</strong></td>
                <td style="text-align: right;">5,000원</td>
                </tr>
                <tr>
                <td style="text-align: center;"><strong>일 비</strong></td>
                <td style="text-align: center;"><strong>기 간</strong></td>
                <td colspan="6" style="text-align: center;"></td>
                <td colspan="3"
                style="text-align: center;"><strong>일비정산금</strong></td>
                <td style="text-align: right;">원</td>
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
                <td colspan="2" style="text-align: center;"></td>
                <td style="text-align: center;"></td>
                <td colspan="4" style="text-align: center;"><em>그 밖의 지역</em></td>
                <td colspan="4" style="text-align: right;">원</td>
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
                <td style="text-align: center;"></td>
                <td style="text-align: center;"></td>
                <td style="text-align: center;"></td>
                <td colspan="2" style="text-align: center;"></td>
                <td colspan="2" style="text-align: center;"><em>유류비</em></td>
                <td colspan="4" style="text-align: right;">원</td>
                </tr>
                <tr>
                <td style="text-align: center;"></td>
                <td style="text-align: center;"></td>
                <td style="text-align: center;"></td>
                <td colspan="2" style="text-align: center;"></td>
                <td colspan="2" style="text-align: center;"><em>통행료</em></td>
                <td colspan="4" style="text-align: right;">원</td>
                </tr>
                <tr>
                <td style="text-align: center;"></td>
                <td style="text-align: center;"></td>
                <td style="text-align: center;"></td>
                <td colspan="2" style="text-align: center;"></td>
                <td colspan="2" style="text-align: center;"><em>승차권</em></td>
                <td colspan="4" style="text-align: right;">원</td>
                </tr>
                <tr>
                <td style="text-align: center;"></td>
                <td style="text-align: center;"></td>
                <td style="text-align: center;"></td>
                <td colspan="2" style="text-align: center;"></td>
                <td colspan="2" style="text-align: center;"></td>
                <td colspan="4" style="text-align: right;">원</td>
                </tr>
                <tr>
                <td style="text-align: center;"><p><strong>출장금액</strong></p>
                <p><strong>(합계)</strong></p></td>
                <td colspan="5" style="text-align: right;"><strong>원</strong></td>
                <td colspan="2"
                style="text-align: center;"><strong>예산항목</strong></td>
                <td colspan="4" style="text-align: center;">국내여비</td>
                </tr>
                <tr>
                <td style="text-align: center;"><strong>계좌번호</strong></td>
                <td colspan="5" style="text-align: center;"></td>
                <td colspan="2" style="text-align: center;"><strong>은 행</strong></td>
                <td colspan="4" style="text-align: center;"></td>
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

            String prompt = String.format("""
            너는 주어진 JSON을 분석하여, 문서의 내용을 주어진 기존 gfm에 맞춰 새로운 gfm 을 생성하는 전문가야.
            
            다음 지침을 반드시 따라줘:
            1. '입력 JSON'의 내용을 분석해 기존의 있는 gfm을 보고 틀은 바꾸지 않고 분석한 값을 채워 넣어줘.
            2. JSON분석 내용에서 적절한 정보가 없는 항목은 빈 문자열("")로 남겨둬.
            3. 너의 답변은 오직 기존의 마크다운의 틀을 유지한채 JSON의 값을 보고 값만 추가해야해. 다른 설명이나 인사말, 코드 블록 마크다운(```json)을 절대 포함하지 마.
    
            ---
            [기존의 markdown]
            %s
            ---
            [예시 json]
            %s
            [완성된 markdown 예시]
            %s
            
            ---
            
            ACTUAL INPUT
            [입력 JSON]
            
            %s
        """, markdownContentBefore, jsonResponseTemplate, resultMarkdown, jsonAfter);

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
        }catch (Exception e) {
            throw new RuntimeException("이미지 처리 중 오류가 발생했습니다.", e);
        }
    }

}
