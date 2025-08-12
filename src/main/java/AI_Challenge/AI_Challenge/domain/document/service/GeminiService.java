package AI_Challenge.AI_Challenge.domain.document.service;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import com.theokanning.openai.service.OpenAiService;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
public class GeminiService {

    private final OpenAiService openAiService;
    private final DocumentService documentService;

    public GeminiService(@Value("${openai.api.key}") String apiKey, DocumentService documentService) {
        this.openAiService = new OpenAiService(apiKey);
        this.documentService = documentService;
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

    public String extractTextFromDocByGemini(MultipartFile markdownFile) {
        try {
            Client client = new Client();

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
            String markdownText = new String(markdownFile.getBytes(), StandardCharsets.UTF_8);

            String prompt = String.format("""
            너는 주어진 마크다운 문서를 분석하여, 문서의 내용을 '분석할 JSON 양식'에 맞춰 추출하는 전문가야.
            
            다음 지침을 반드시 따라줘:
            1. '입력 마크다운 텍스트'의 내용을 분석해서 '분석할 JSON 양식'의 비어있는 value 값을 모두 채워줘.
            2. 문서에 정보가 없는 항목은 빈 문자열("")로 남겨둬.
            3. 너의 답변은 오직 완성된 JSON 객체여야만 해. 다른 설명이나 인사말, 코드 블록 마크다운(```json)을 절대 포함하지 마.
    
            ---
            [분석할 JSON 양식]
            %s
            ---
            [입력 마크다운 텍스트]
            %s
            ---
            [완성된 JSON 출력]
        """, jsonTemplate, markdownText);

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

            log.info("문서 처리 완료: {}", markdownFile.getOriginalFilename());
            return response.text();

        } catch (Exception e) {
            log.error("이미지 처리 중 오류 발생: {}", markdownFile.getOriginalFilename(), e);
            throw new RuntimeException("이미지 처리 중 오류가 발생했습니다.", e);
        }
    }



}
