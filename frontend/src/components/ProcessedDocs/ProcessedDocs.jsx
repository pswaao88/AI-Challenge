// src/components/ProcessedDocs/ProcessedDocs.jsx
import React from 'react';
import styled from 'styled-components';
import axios from 'axios';

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

const ResultContainer = styled.div`
  width: 100%;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
`;
const ResultItem = styled.div`
  margin-bottom: 20px;
  padding: 10px;
  border-bottom: 1px solid #eee;
`;

const FileName = styled.h3`
  color: #333;
  margin-bottom: 10px;
`;

const ResponseText = styled.pre`
  white-space: pre-wrap;
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
`;

function ProcessedDocs({ docs, isLoading }) {
  const handleDownload = async (doc) => {
    try {
      // 1. Gemini API 호출
      const formData = new FormData();
      formData.append('prompt', "이미지에서 텍스트를 추출하고 깔끔하게 정리해주세요.");
      formData.append('images', doc.file);

      const geminiResponse = await axios.post(
          `/api/gemini/generate`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
      );

      if (!geminiResponse.data || !geminiResponse.data.response) {
        throw new Error('Gemini API 응답이 올바르지 않습니다.');
      }

      // 2. 텍스트 파일 생성
      const textContent = geminiResponse.data.response;
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });

      // 3. 다운로드 링크 생성
      const fileName = doc.fileName.replace(/\.[^/.]+$/, '') + '.txt';
      const url = window.URL.createObjectURL(blob);

      // 4. 다운로드 실행
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      // 5. 정리
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('다운로드 처리 중 오류:', error);
      if (error.response) {
        // 서버 응답이 있는 경우
        alert(`서버 오류: ${error.response.data.message || '알 수 없는 오류가 발생했습니다.'}`);
      } else if (error.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우
        alert('서버와 통신할 수 없습니다. 네트워크 연결을 확인해주세요.');
      } else {
        // 요청 설정 중 오류가 발생한 경우
        alert(`오류 발생: ${error.message}`);
      }
    }
  };

  return (
      <Container>
        <Title>처리된 문서</Title>
        {isLoading ? (
            <LoadingSpinner />
        ) : (
            <DocList>
              {Array.isArray(docs) && docs.map((doc, index) => (
                  <DocItem key={index}>
                    <DocName>{doc.fileName}</DocName>
                    <DownloadButton
                        onClick={() => handleDownload(doc)}
                        disabled={!doc.file}
                    >
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
