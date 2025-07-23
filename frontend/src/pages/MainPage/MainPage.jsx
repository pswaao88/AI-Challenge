// src/pages/MainPage/MainPage.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import FileUpload from '../../components/FileUpload/FileUpload';
import DocSelector from '../../components/DocSelector/DocSelector';
import ProcessedDocs from '../../components/ProcessedDocs/ProcessedDocs';

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

function MainPage() {
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [processedDocs, setProcessedDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleProcessDocs = async () => {
    if (selectedDocs.length === 0) return;

    setIsLoading(true);
    // 실제로는 여기서 API 호출을 하겠지만, 지금은 타이머로 대체
    setTimeout(() => {
      setProcessedDocs(selectedDocs);
      setIsLoading(false);
    }, 2000);
  };

  return (
      <Container>
        <Title>AI Challenge</Title>
        <Section>
          <ProcessFlow>
            <Step>
              <StepNumber>Step 1</StepNumber>
              <FileUpload />
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
