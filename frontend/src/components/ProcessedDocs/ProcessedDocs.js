// src/components/ProcessedDocs/ProcessedDocs.jsx
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  min-width: 250px;
  background-color: #f8f8f8;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Title = styled.h3`
  margin-bottom: 15px;
  color: #333;
  font-size: 1.1rem;
  text-align: center;
`;

const DocList = styled.div`
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 15px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }
`;

const DocItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px; // 패딩 증가
  margin-bottom: 12px; // 마진 증가
  background: white;
  border-radius: 4px;
  border: 1px solid #ddd;
  gap: 20px; // 요소들 사이 간격 추가
`;

const DocName = styled.span`
  flex: 1;
  font-size: 0.9rem;
  color: #444;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DownloadButton = styled.button`
  background-color: #17a2b8;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px; // 패딩 증가
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  min-width: 100px; // 최소 너비 설정

  &:hover {
    background-color: #138496;
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;


const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  
  &:after {
    content: '';
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

function ProcessedDocs({ docs, isLoading }) {
  const handleDownload = (doc) => {
    // 실제 다운로드 로직을 여기에 구현
    // 임시로 콘솔에 기록
    console.log('Downloading:', doc.name);
    
    // 임시 다운로드 시뮬레이션
    const element = document.createElement('a');
    const file = new Blob(['임시 파일 내용'], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = doc.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Container>
      <Title>처리된 문서</Title>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <DocList>
          {docs.map(doc => (
            <DocItem key={doc.id}>
              <DocName>{doc.name}</DocName>
              <DownloadButton onClick={() => handleDownload(doc)}>
                다운로드
              </DownloadButton>
            </DocItem>
          ))}
        </DocList>
      )}
    </Container>
  );
}

export default ProcessedDocs;
