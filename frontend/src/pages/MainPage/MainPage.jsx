// src/pages/MainPage/MainPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/config';
import styled from 'styled-components';
import FileUpload from '../../components/FileUpload/FileUpload';
import DocSelector from '../../components/DocSelector/DocSelector';
import ProcessedDocs from '../../components/ProcessedDocs/ProcessedDocs';
import {fetchDocuments} from "../../services/documentService";

const Container = styled.div`
  max-width: 1800px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 40px;
  color: #333;
  font-size: 2.5rem;
`;

const Section = styled.section`
  padding: 40px;
  margin-bottom: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  max-height: 90vh;
  overflow-y: auto;
`;

const ProcessFlow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 60px; // 120px에서 60px로 수정
  text-align: center;
  padding: 0 40px;
`;

const Step = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-width: 400px;
  padding: 20px;
`;

const StepNumber = styled.div`
  font-size: 1.4rem;
  color: #666;
  margin-bottom: 30px;
  font-weight: bold;
  width: 100%;
  text-align: center;
  padding-top: 15px;
`;

const ArrowButton = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  color: #28a745;
  cursor: pointer;
  padding: 10px;
  transition: transform 0.3s ease;
  margin-top: 200px;
  
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
  margin: 10px 0;
  padding: 10px;
  background-color: #ffe6e6;
  border-radius: 4px;
`;


function MainPage() {
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [processedDocs, setProcessedDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]); // errors 상태 추가

  const handleProcessDocs = async () => {
    if (selectedDocs.length === 0) return;

    setIsLoading(true);
    try {
      const uploadPromises = selectedDocs.map(async (doc) => {
        // DB에 있는 문서는 file 속성이 없음
        if (!doc.file) {
          // DB 문서는 바로 처리된 상태로 반환
          return {
            ...doc,
            fileName: `(완료) ${doc.fileName || doc.name}`
          };
        }

        // 새로운 파일 업로드
        const formData = new FormData();
        formData.append('file', doc.file);
        const response = await axios.post(`${API_BASE_URL}/documents/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // 업로드된 문서에도 (완료) 표시 추가
        return {
          ...response.data,
          fileName: `(완료) ${response.data.fileName || response.data.name}`
        };
      });

      const results = await Promise.all(uploadPromises);
      setProcessedDocs(results);
    } catch (error) {
      console.error('Upload error:', error);
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
              <FileUpload onFilesChange={setSelectedDocs} />
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
