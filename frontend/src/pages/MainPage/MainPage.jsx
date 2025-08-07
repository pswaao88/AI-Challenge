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
  const [processedDocs, setProcessedDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors] = useState([]);

  const handleProcessDocs = async () => {
    if (selectedDocs.length === 0) return;

    setIsLoading(true);
    try {
      const uploadPromises = selectedDocs.map(async (doc) => {
        // 파일 이름 안전하게 가져오기
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

        // 텍스트 파일 생성
        const textContent = geminiResponse.data.response;
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });

        // 파일 이름에서 확장자 제거하고 .txt 추가
        const baseFileName = originalFileName.split('.')[0];
        const newFileName = `${baseFileName}.txt`;

        // 다운로드 실행
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
          ...doc,
          fileName: `(완료) ${originalFileName}`
        };
      });

      const results = await Promise.all(uploadPromises);
      setProcessedDocs(results);
    } catch (error) {
      console.error('문서 처리 중 오류:', error);
      alert('문서 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <Container>
        <Title>AI Challenge</Title>
        <Section>
          <ProcessFlow>
            <Step>
              <StepNumber>Step 1</StepNumber>
              <ImageUpload onFilesChange={setSelectedDocs} />
            </Step>
            <Step>
              <StepNumber>Step 2</StepNumber>
              <DocSelector
                  onDocsSelect={setSelectedDocs}
              />
            </Step>
            <ArrowButton
                onClick={handleProcessDocs}
                disabled={selectedDocs.length === 0 || isLoading}
            >
              →
            </ArrowButton>
            <Step>
              <StepNumber>Step 3</StepNumber>
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
