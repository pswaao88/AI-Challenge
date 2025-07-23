// src/components/DownloadButton/DownloadButton.jsx
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 250px;
  height: 200px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;
  position: relative;
  margin: 10px;
  padding: 15px;
`;

const Button = styled.button`
  background-color: #17a2b8;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 15px 30px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.3s ease;

  &:hover {
    background-color: #138496;
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

function DownloadButton() {
  const handleDownload = () => {
    // 여기에 LLM 처리 및 다운로드 로직 추가
    console.log('Processing and downloading...');
  };

  return (
      <Container>
        <Button onClick={handleDownload}>
          서류 작성 완료 및 다운로드
        </Button>
      </Container>
  );
}

export default DownloadButton;
