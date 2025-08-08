import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchProcessedDocuments, downloadProcessedDocument } from '../../services/documentService';

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
  padding: 12px 16px;
  margin-bottom: 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #ddd;
  gap: 20px;
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
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  min-width: 100px;

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

const RefreshButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-bottom: 15px;
  width: 100%;

  &:hover {
    background-color: #218838;
  }
`;

function ProcessedDocs({ realtimeDocs, isLoading }) { // Prop 이름 변경
  const [processedFiles, setProcessedFiles] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadProcessedFiles();
  }, []);

  const loadProcessedFiles = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetchProcessedDocuments();
      setProcessedFiles(response.data);
    } catch (error) {
      console.error('처리된 문서 목록 로딩 에러:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDownload = async (fileName) => {
    try {
      const response = await downloadProcessedDocument(fileName);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('파일 다운로드 에러:', error);
      alert('파일 다운로드 중 오류가 발생했습니다.');
    }
  };

  return (
      <Container>
        <Title>처리 결과 및 저장된 문서</Title>

        {isLoading ? (
            <LoadingSpinner />
        ) : (
            <DocList>
              {/* 실시간 처리 결과 표시 */}
              {Array.isArray(realtimeDocs) && realtimeDocs.length > 0 && (
                  <ResultItem>
                    <FileName>🆕 실시간 처리 결과 (새로고침 시 사라집니다)</FileName>
                    <ResponseText>{realtimeDocs[0]?.response}</ResponseText>
                  </ResultItem>
              )}

              <RefreshButton onClick={loadProcessedFiles} disabled={isRefreshing}>
                {isRefreshing ? '목록 새로고침 중...' : '저장된 문서 목록 새로고침'}
              </RefreshButton>

              {/* 서버에 저장된 처리된 파일들 표시 */}
              {Array.isArray(processedFiles) && processedFiles.map((file, index) => (
                  <DocItem key={`processed-${index}`}>
                    <DocName>📄 {file.fileName}</DocName>
                    <DownloadButton onClick={() => handleDownload(file.fileName)}>
                      다운로드
                    </DownloadButton>
                  </DocItem>
              ))}

              {/* 빈 상태 메시지 */}
              {!isLoading && !isRefreshing && realtimeDocs.length === 0 && processedFiles.length === 0 && (
                  <DocItem>
                    <DocName>처리된 문서가 없습니다.</DocName>
                  </DocItem>
              )}
            </DocList>
        )}
      </Container>
  );
}

export default ProcessedDocs;
