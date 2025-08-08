import React, { useState } from 'react';
import styled from 'styled-components';
import DocSelector from "../../components/DocSelector/DocSelector";
import ImageUpload from '../../components/FileUpload/ImageUpload';
import ProcessedDocs from '../../components/ProcessedDocs/ProcessedDocs';
import { processImageWithGemini, uploadDocument, createAndDownloadDocument } from '../../services/documentService';

const Container = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: 16px;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 32px;
  color: #333;
  font-size: 2rem;
`;

const Section = styled.section`
  padding: 30px;
  margin-bottom: 32px;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  max-height: 72vh;
  overflow-y: auto;
`;

const ProcessFlow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 48px;
  text-align: center;
  padding: 0 32px;
`;

const Step = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-width: 320px;
  padding: 16px;
`;

const StepNumber = styled.div`
  font-size: 1.12rem;
  color: #666;
  margin-bottom: 24px;
  font-weight: bold;
  width: 100%;
  text-align: center;
  padding-top: 12px;
`;

const ArrowButton = styled.button`
  background: none;
  border: none;
  font-size: 1.6rem;
  color: #28a745;
  cursor: pointer;
  padding: 8px;
  transition: transform 0.3s ease;
  margin-top: 160px;

  &:hover {
    transform: scale(1.2);
  }

  &:disabled {
    color: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const ProcessingStatus = styled.div`
  background-color: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 4px;
  padding: 15px;
  margin: 20px 0;
  text-align: center;
  color: #1976d2;
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  text-align: center;
  margin: 8px 0;
  padding: 8px;
  background-color: #ffe6e6;
  border-radius: 3px;
`;

// 다운로드 버튼 컴포넌트
const DownloadButton = styled.a`
  display: inline-block;
  background-color: #17a2b8;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  text-decoration: none;
  margin-top: 10px;
  cursor: pointer;

  &:hover {
    background-color: #138496;
  }
`;

function MainPage() {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedDocxDocs, setSelectedDocxDocs] = useState([]);
  const [processedDocs, setProcessedDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [processingStatus, setProcessingStatus] = useState('');
  const [downloadUrl, setDownloadUrl] = useState(null); // 다운로드 URL 상태 추가
  const [resultFileName, setResultFileName] = useState(''); // 파일명 상태 추가

  const handleImagesChange = (images) => {
    setUploadedImages(images);
    setErrors([]);
  };

  const handleDocxSelect = (docs) => {
    setSelectedDocxDocs(docs);
    setErrors([]);
  };

  const handleProcessDocs = async () => {
    if (uploadedImages.length === 0 || selectedDocxDocs.length === 0) {
      setErrors(['이미지와 문서를 모두 선택해주세요.']);
      return;
    }

    setIsLoading(true);
    setErrors([]);
    setProcessedDocs([]);
    setDownloadUrl(null); // 새 작업 시작 시 다운로드 URL 초기화
    setResultFileName(''); // 새 작업 시작 시 파일명 초기화

    try {
      setProcessingStatus('이미지에서 텍스트를 추출하고 있습니다...');

      // 1. Gemini API로 이미지에서 텍스트 추출
      const geminiResponse = await processImageWithGemini(
          "이미지에서 텍스트를 추출하고 깔끔하게 정리해주세요. 추출된 텍스트를 기반으로 문서를 작성해주세요.",
          uploadedImages
      );
      const extractedText = geminiResponse.data;
      console.log(extractedText);
      // 2. 선택된 DOCX 문서들을 서버에 업로드
      const uploadedDocuments = [];
      for (let doc of selectedDocxDocs) {
        if (doc.file) { // 새로 업로드한 파일인 경우
          setProcessingStatus(`문서 업로드 중: ${doc.name}`);
          const uploadResponse = await uploadDocument(doc.file);
          uploadedDocuments.push(uploadResponse.data);
        } else { // DB에 이미 있는 파일인 경우
          uploadedDocuments.push(doc);
        }
      }

      // 3. 서버에 최종 문서 생성 및 다운로드 요청
      setProcessingStatus('최종 문서를 생성하고 있습니다...');

      const selectedDocId = uploadedDocuments[0].id;
      const selectedDocName = uploadedDocuments[0].fileName;

      const processResponse = await createAndDownloadDocument(selectedDocId, extractedText);

      // 처리된 파일의 다운로드 URL 생성
      const url = window.URL.createObjectURL(new Blob([processResponse.data]));
      setDownloadUrl(url);

      // 서버에서 반환한 파일 이름을 받아서 저장
      const contentDisposition = processResponse.headers['content-disposition'];
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
      const newFileName = fileNameMatch ? fileNameMatch[1] : 'processed_document.docx';
      setResultFileName(newFileName);

      // 실시간 결과 표시
      setProcessedDocs([{
        fileName: newFileName,
        response: extractedText
      }]);
      setProcessingStatus('문서 처리가 완료되었습니다.');

    } catch (error) {
      console.error('문서 처리 중 전체 오류:', error);
      setErrors([error.message || '문서 처리 중 오류가 발생했습니다.']);
      setProcessingStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = uploadedImages.length > 0 && selectedDocxDocs.length > 0 && !isLoading;

  return (
      <Container>
        <Title>AI Challenge - 문서 처리 시스템</Title>
        <Section>
          <ProcessFlow>
            <Step>
              <StepNumber>1. 이미지 업로드</StepNumber>
              <ImageUpload onFilesChange={handleImagesChange} />
            </Step>

            <Step>
              <StepNumber>2. 문서 템플릿 선택</StepNumber>
              <DocSelector onDocsSelect={handleDocxSelect} />
            </Step>

            <ArrowButton
                onClick={handleProcessDocs}
                disabled={!canProceed}
                title={
                  canProceed
                      ? '문서 처리 시작'
                      : '이미지와 문서 템플릿을 모두 선택해주세요'
                }
            >
              {isLoading ? '🔄' : '→'}
            </ArrowButton>

            <Step>
              <StepNumber>3. 처리 결과 및 다운로드</StepNumber>

              {processingStatus && (
                  <ProcessingStatus>{processingStatus}</ProcessingStatus>
              )}

              {errors.length > 0 && (
                  <div>
                    {errors.map((error, index) => (
                        <ErrorMessage key={index}>{error}</ErrorMessage>
                    ))}
                  </div>
              )}

              {/* 실시간 결과가 있을 때만 다운로드 버튼 표시 */}
              {downloadUrl && (
                  <DownloadButton href={downloadUrl} download={resultFileName}>
                    결과 파일 다운로드
                  </DownloadButton>
              )}

              <ProcessedDocs
                  docs={processedDocs} // <-- 'realtimeDocs' 대신 'docs'로 변경
                  isLoading={isLoading}
              />
            </Step>
          </ProcessFlow>
        </Section>
      </Container>
  );
}

export default MainPage;
