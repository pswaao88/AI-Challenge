import React from 'react'; // useState, useEffect 제거
import styled from 'styled-components';
// fetchProcessedDocuments, downloadProcessedDocument 제거

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

const ResultItem = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #eee;
`;

const FileName = styled.h4`
  color: #333;
  margin-bottom: 10px;
  font-size: 1rem;
`;

const ResponseText = styled.pre`
  white-space: pre-wrap;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  font-size: 14px;
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
`;

const DocItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #ddd;
  gap: 20px;
`;

function ProcessedDocs({ realtimeDocs, isLoading }) {
  // 기존 state(processedFiles, isRefreshing) 및 useEffect 제거

  return (
      <Container>
        <Title>처리 결과</Title> {/* 제목 변경 */}

        {isLoading ? (
            <LoadingSpinner />
        ) : (
            <DocList>
              {/* 실시간 처리 결과만 표시 */}
              {Array.isArray(realtimeDocs) && realtimeDocs.length > 0 && (
                  <ResultItem>
                    <FileName>🆕 {realtimeDocs[0]?.fileName}</FileName>
                    <ResponseText>{realtimeDocs[0]?.response}</ResponseText>
                  </ResultItem>
              )}

              {/* 실시간 결과가 없을 때 메시지 */}
              {!isLoading && realtimeDocs.length === 0 && (
                  <DocItem>
                    <FileName>처리된 결과가 없습니다.</FileName>
                  </DocItem>
              )}
            </DocList>
        )}
      </Container>
  );
}

export default ProcessedDocs;
