import React, { useState } from 'react';
import styled from 'styled-components';
import DocSelector from "../../components/DocSelector/DocSelector";
import ImageUpload from '../../components/FileUpload/ImageUpload';
import ProcessedDocs from '../../components/ProcessedDocs/ProcessedDocs';
import { processImageWithGemini, uploadDocument, processAndDownloadDocument } from '../../services/documentService';

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

function MainPage() {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedDocxDocs, setSelectedDocxDocs] = useState([]);
  const [processedDocs, setProcessedDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [processingStatus, setProcessingStatus] = useState('');

  // 이미지 업로드 핸들러
  const handleImagesChange = (images) => {
    setUploadedImages(images);
    setErrors([]); // 에러 초기화
  };

  // DocSelector에서 docx 선택 핸들러
  const handleDocxSelect = (docs) => {
    setSelectedDocxDocs(docs);
    setErrors([]); // 에러 초기화
  };

  const handleProcessDocs = async () => {
    if (uploadedImages.length === 0 || selectedDocxDocs.length === 0) {
      setErrors(['이미지와 문서를 모두 선택해주세요.']);
      return;
    }

    setIsLoading(true);
    setErrors([]);
    setProcessedDocs([]);

    try {
      setProcessingStatus('이미지에서 텍스트를 추출하고 있습니다...');

      // 1. 먼저 선택된 DOCX 문서들을 서버에 업로드
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

      // 2. Gemini API로 이미지 처리
      setProcessingStatus('이미지에서 텍스트를 추출하고 있습니다...');
      const geminiResponse = await processImageWithGemini(
          "이미지에서 텍스트를 추출하고 깔끔하게 정리해주세요. 추출된 텍스트를 기반으로 문서를 작성해주세요.",
          uploadedImages
      );

      // 3. 각 업로드된 문서와 이미지 결과를 결합하여 최종 문서 생성
      const results = [];
      for (let i = 0; i < uploadedDocuments.length; i++) {
        const uploadedDoc = uploadedDocuments[i];
        setProcessingStatus(`문서 처리 중: ${uploadedDoc.fileName}`);

        try {
          // 문서 처리 및 다운로드
          const processResponse = await processAndDownloadDocument(
              uploadedDoc.id,
              uploadedDoc.fileName,
              true
          );

          // 처리된 파일 자동 다운로드
          const url = window.URL.createObjectURL(new Blob([processResponse.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `processed_${uploadedDoc.fileName}`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);

          results.push({
            fileName: `processed_${uploadedDoc.fileName}`,
            response: `문서 '${uploadedDoc.fileName}'가 성공적으로 처리되어 다운로드되었습니다.\n\n추출된 텍스트:\n${JSON.stringify(geminiResponse.data, null, 2)}`
          });
        } catch (docError) {
          console.error(`문서 처리 에러 (${uploadedDoc.fileName}):`, docError);
          results.push({
            fileName: `error_${uploadedDoc.fileName}`,
            response: `문서 처리 중 오류가 발생했습니다: ${docError.message}`
          });
        }
      }

      setProcessedDocs(results);
      setProcessingStatus('');

    } catch (error) {
      console.error('문서 처리 중 전체 오류:', error);
      setErrors([error.message || '문서 처리 중 오류가 발생했습니다.']);
      setProcessingStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  // 처리 가능 여부 확인
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
