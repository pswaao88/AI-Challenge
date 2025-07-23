// src/pages/MainPage/MainPage.jsx
import React from 'react';
import styled from 'styled-components';
import FileUpload from '../../components/FileUpload/FileUpload';
import DocSelector from '../../components/DocSelector/DocSelector';
import DownloadButton from '../../components/DownloadButton/DownloadButton';

const Container = styled.div`
  max-width: 1200px;
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
  padding: 20px;
  margin-bottom: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  max-height: 80vh;
  overflow-y: auto;
`;

const ProcessFlow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 40px;
`;

const Step = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StepNumber = styled.div`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 10px;
  font-weight: bold;
`;

function MainPage() {
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
              <DocSelector />
            </Step>

            <Step>
              <StepNumber>Step 3</StepNumber>
              <DownloadButton />
            </Step>
          </ProcessFlow>
        </Section>
      </Container>
  );
}

export default MainPage;
