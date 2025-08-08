// src/pages/MainPage/MainPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/config';
import styled from 'styled-components';
import DocSelector from "../../components/DocSelector/DocSelector";
import ImageUpload from '../../components/FileUpload/ImageUpload';
import ProcessedDocs from '../../components/ProcessedDocs/ProcessedDocs';

const Container = styled.div`
  max-width: 1440px;  // 1800px의 80%
  margin: 0 auto;
  padding: 16px;  // 20px의 80%
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 32px;  // 40px의 80%
  color: #333;
  font-size: 2rem;  // 2.5rem의 80%
`;

const Section = styled.section`
  padding: 30px;  // 40px의 80%
  margin-bottom: 32px;  // 40px의 80%
  background-color: white;
  border-radius: 6px;  // 8px의 80%
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  max-height: 72vh;  // 90vh의 80%
  overflow-y: auto;
`;

const ProcessFlow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 48px;  // 60px의 80%
  text-align: center;
  padding: 0 32px;  // 40px의 80%
`;

const Step = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-width: 320px;  // 400px의 80%
  padding: 16px;  // 20px의 80%
`;

const StepNumber = styled.div`
  font-size: 1.12rem;  // 1.4rem의 80%
  color: #666;
  margin-bottom: 24px;  // 30px의 80%
  font-weight: bold;
  width: 100%;
  text-align: center;
  padding-top: 12px;  // 15px의 80%
`;

const ArrowButton = styled.button`
  background: none;
  border: none;
  font-size: 1.6rem;  // 2rem의 80%
  color: #28a745;
  cursor: pointer;
  padding: 8px;  // 10px의 80%
  transition: transform 0.3s ease;
  margin-top: 160px;  // 200px의 80%

  &:hover {
    transform: scale(1.2);
  }

  &:disabled {
    color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  text-align: center;
  margin: 8px 0;  // 10px의 80%
  padding: 8px;  // 10px의 80%
  background-color: #ffe6e6;
  border-radius: 3px;  // 4px의 80%
`;

function MainPage() {
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]); // 이미지 상태 추가
  const [selectedDocxDocs, setSelectedDocxDocs] = useState([]); // DocSelector에서 선택된 docx 상태 추가
  const [processedDocs, setProcessedDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors] = useState([]);

  // 이미지 업로드 핸들러
  const handleImagesChange = (images) => {
    setUploadedImages(images);
    setSelectedDocs(images); // 기존 로직 유지
  };

  // DocSelector에서 docx 선택 핸들러
  const handleDocxSelect = (docs) => {
    setSelectedDocxDocs(docs);
  };

  const handleProcessDocs = async () => {
    if (selectedDocs.length === 0) return;

    setIsLoading(true);
    try {
      const uploadPromises = selectedDocs.map(async (doc) => {
        const originalFileName = doc.fileName || doc.name || 'untitled';

        const formData = new FormData();
        formData.append('prompt', "이미지에서 텍스트를 추출하고 깔끔하게 정리해주세요.");
        formData.append('images', doc.file);

        const geminiResponse = await axios.post(
            '/api/gemini/generate',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
        );

        // 객체를 보기 좋게 포맷팅된 문자열로 변환
        const formattedResponse = JSON.stringify(geminiResponse.data, null, 2);

        if (!formattedResponse) {
          throw new Error(`${originalFileName} 처리 중 빈 응답이 왔습니다.`);
        }

        const blob = new Blob([formattedResponse], { type: 'text/plain;charset=utf-8' });
        const baseFileName = originalFileName.split('.')[0];
        const newFileName = `${baseFileName}.txt`;

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = newFileName;
        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        return {
          fileName: originalFileName,
          response: formattedResponse
        };
      });

      const results = await Promise.all(uploadPromises);
      setProcessedDocs(results);
    } catch (error) {
      console.error('문서 처리 중 오류:', error);
      alert(error.message || '문서 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 화살표 활성화 조건: 이미지 1개 이상 && docx 1개 이상
  const canProceed = uploadedImages.length > 0 && selectedDocxDocs.length > 0;

  return (
      <Container>
        <Title>AI Challenge</Title>
        <Section>
          <ProcessFlow>
            <Step>
              <StepNumber>1. 이미지 업로드</StepNumber>
              <ImageUpload onFilesChange={handleImagesChange} />
            </Step>
            <Step>
              <StepNumber>2. 문서 업로드 및 선택</StepNumber>
              <DocSelector
                  onDocsSelect={handleDocxSelect}
              />
            </Step>
            <ArrowButton
                onClick={handleProcessDocs}
                disabled={!canProceed || isLoading}
                title={
                  canProceed
                      ? '문서 처리 시작'
                      : '이미지 1개 이상 업로드 및 docx 1개 이상 선택해주세요'
                }
            >
              →
            </ArrowButton>
            <Step>
              <StepNumber>3. 결과 및 다운로드</StepNumber>
              {errors.length > 0 && (
                  <div>
                    {errors.map((error, index) => (
                        <ErrorMessage key={index}>{error}</ErrorMessage>
                    ))}
                  </div>
              )}
              <ProcessedDocs
                  docs={processedDocs}
                  isLoading={isLoading}
              />
            </Step>
          </ProcessFlow>
        </Section>
      </Container>
  );
}

export default MainPage;
