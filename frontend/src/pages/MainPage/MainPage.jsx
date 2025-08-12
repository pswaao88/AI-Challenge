import React, { useState } from 'react';
import styled from 'styled-components';
import logoImage from '../../assets/logo.png';
import DocSelector from "../../components/DocSelector/DocSelector";
import ImageUpload from '../../components/FileUpload/ImageUpload';
import ProcessedDocs from '../../components/ProcessedDocs/ProcessedDocs';
import { processImageWithGemini, uploadDocument, createAndDownloadDocument } from '../../services/documentService';

// --- 레이아웃 컴포넌트 ---

const PageLayout = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto 1fr;
  height: 100vh;
  background-color: #f7f9fc;
`;

const Title = styled.h1`
  grid-column: 1 / -1;
  text-align: center;
  margin: 0;
  padding: 24px;
  color: #3b475f;
  font-size: 2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border-bottom: 1px solid #e9ecef;
`;

const LogoImage = styled.img`
  width: 48px;
  height: 48px;
  margin-right: 16px;
  object-fit: contain; /* 이미지가 잘리지 않고 비율에 맞게 채워지도록 설정 */
`;

const InputArea = styled.div`
  padding: 32px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const OutputArea = styled.main`
  padding: 32px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #ffffff;
  border-left: 1px solid #e9ecef;
`;

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  flex: 1;
  min-height: 0;
`;


const Step = styled.div`
  display: flex;
  flex-direction: column;
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  overflow: hidden;
`;

const StepTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: ${({ isCompleted }) => (isCompleted ? '600' : 'normal')};
  color: ${({ isCompleted }) => (isCompleted ? '#495057' : '#adb5bd')};
  margin: 0 0 16px 0;
  text-align: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
`;

const StepContent = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #d8dde3;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-track {
    background-color: #f1f1f1;
  }
`;

const ActionButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 32px;
  flex-shrink: 0;
`;

const GenerateButton = styled.button`
  padding: 16px 48px;
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  background-color: #546381;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(84, 99, 129, 0.2);

  &:hover {
    background-color: #3b475f;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(84, 99, 129, 0.3);
  }

  &:disabled {
    background-color: #ced4da;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ResultsPlaceholder = styled.div`
  text-align: center;
  color: #adb5bd;
  font-size: 1.2rem;
`;

const ResultsWrapper = styled.div`
  width: 100%;
  text-align: left;
`;

const ProcessingStatus = styled.div`
  background-color: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
  color: #1976d2;
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  background-color: #ffe6e6;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
`;

const DownloadButton = styled.a`
  display: inline-block;
  background-color: #28a745;
  color: white;
  padding: 12px 24px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  margin-top: 16px;
  cursor: pointer;

  &:hover {
    background-color: #218838;
  }
`;

function MainPage() {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedDocxDocs, setSelectedDocxDocs] = useState([]);
  const [processedDocs, setProcessedDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [processingStatus, setProcessingStatus] = useState('');
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [resultFileName, setResultFileName] = useState('');

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
    setDownloadUrl(null);
    setResultFileName('');
    try {
      setProcessingStatus('이미지에서 텍스트를 추출하고 있습니다...');
      const geminiResponse = await processImageWithGemini(uploadedImages);
      const extractedText = geminiResponse.data.map(item => item.response).join('\n\n');
      const uploadedDocuments = [];
      for (let doc of selectedDocxDocs) {
        if (doc.file) {
          setProcessingStatus(`문서 업로드 중: ${doc.name}`);
          const uploadResponse = await uploadDocument(doc.file);
          uploadedDocuments.push(uploadResponse.data);
        } else {
          uploadedDocuments.push(doc);
        }
      }
      setProcessingStatus('최종 문서를 생성하고 있습니다...');
      const selectedDocId = uploadedDocuments[0].id;
      const selectedDocName = uploadedDocuments[0].fileName;
      const requestData = { documentId: selectedDocId, textContent: extractedText };
      const processResponse = await createAndDownloadDocument(requestData);
      const url = window.URL.createObjectURL(new Blob([processResponse.data]));
      setDownloadUrl(url);
      let newFileName = `(완료) ${selectedDocName.replace(/\.docx?$/, '')}.docx`;
      setResultFileName(newFileName);
      setProcessedDocs([{ fileName: newFileName, response: extractedText }]);
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
      <PageLayout>
        {/* [수정] Title을 PageLayout의 첫 번째 자식으로 이동 */}
        <Title>
          <LogoImage src={logoImage} alt="AI 문서 자동화 시스템 로고" />
          AI 문서 자동화 시스템
        </Title>

        <InputArea>
          <InputGrid>
            <Step>
              <StepTitle isCompleted={uploadedImages.length > 0}>
                1. 이미지 업로드
              </StepTitle>
              <StepContent>
                <ImageUpload onFilesChange={handleImagesChange} />
              </StepContent>
            </Step>
            <Step>
              <StepTitle isCompleted={selectedDocxDocs.length > 0}>
                2. 문서 템플릿 선택
              </StepTitle>
              <StepContent>
                <DocSelector onDocsSelect={handleDocxSelect} />
              </StepContent>
            </Step>
          </InputGrid>
          <ActionButtonWrapper>
            <GenerateButton onClick={handleProcessDocs} disabled={!canProceed}>
              {isLoading ? '생성 중...' : '문서 생성하기'}
            </GenerateButton>
          </ActionButtonWrapper>
        </InputArea>

        <OutputArea>
          {!isLoading && errors.length === 0 && processedDocs.length === 0 && (
              <ResultsPlaceholder>
                <p>결과가 여기에 표시됩니다.</p>
              </ResultsPlaceholder>
          )}

          {(isLoading || errors.length > 0 || processedDocs.length > 0) && (
              <ResultsWrapper>
                {isLoading && <ProcessingStatus>{processingStatus}</ProcessingStatus>}
                {errors.length > 0 && errors.map((error, index) => <ErrorMessage key={index}>{error}</ErrorMessage>)}
                {processedDocs.length > 0 && (
                    <>
                      <ProcessedDocs docs={processedDocs} isLoading={isLoading} />
                      {downloadUrl && <DownloadButton href={downloadUrl} download={resultFileName}>결과 파일 다운로드</DownloadButton>}
                    </>
                )}
              </ResultsWrapper>
          )}
        </OutputArea>
      </PageLayout>
  );
}

export default MainPage;
