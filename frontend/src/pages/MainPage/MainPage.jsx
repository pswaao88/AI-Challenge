import React, { useState } from 'react';
import styled from 'styled-components';
import logoImage from '../../assets/logo.png';
import DocSelector from "../../components/DocSelector/DocSelector";
import ImageUpload from '../../components/FileUpload/ImageUpload';
import {
  processImageWithGemini,
  uploadDocument,
  createAndDownloadDocument,
  ensureFileUploadedAndGetId, findIdByName, uploadFileAndGetId
} from '../../services/documentService';

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
  object-fit: contain;
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
  margin: auto;
`;

const ResultsWrapper = styled.div`
  width: 100%;
  text-align: left;
`;

const ProcessingStatus = styled.div`
  background-color: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  color: #1976d2;
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  background-color: #ffe6e6;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
`;

// --- 결과 항목을 위한 새로운 스타일 컴포넌트 ---
const ResultItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid #e9ecef;
`;

const FileName = styled.span`
  font-size: 1rem;
  color: #495057;
  font-weight: 500;
  margin-right: 16px;
  word-break: break-all;
`;

const DownloadButton = styled.a`
  display: inline-block;
  background-color: #28a745;
  color: white;
  padding: 8px 16px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  cursor: pointer;
  font-size: 0.9rem;
  white-space: nowrap;
  transition: background-color 0.2s;

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

    try {
      setProcessingStatus('이미지에서 텍스트를 추출하고 있습니다...');
      const geminiResponse = await processImageWithGemini(uploadedImages);
      const extractedText = geminiResponse.data.map(item => item.response).join('\n\n');

      const processedResults = [];
      for (const doc of selectedDocxDocs) {
        try {
          setProcessingStatus(`'${doc.name}' ID 확인 중...`);
          let documentId;

          // 1. 파일 이름만 보내서 DB에 파일이 이미 존재하는지 먼저 확인합니다.
          const idResponse = await findIdByName(doc.name);
          documentId = idResponse.id;

          // 2. ID를 받아오지 못했다면 (서버에 파일이 없다면),
          //    그때서야 비로소 파일을 업로드하여 새로운 ID를 받습니다.
          if (!documentId) {
            // 이 부분은 프론트엔드가 원본 파일(doc.file)을 가지고 있을 때만 실행 가능합니다.
            if (doc.file && doc.file instanceof File) {
              setProcessingStatus(`'${doc.name}' 신규 파일 업로드 중...`);
              const uploadResponse = await uploadFileAndGetId(doc.file);
              documentId = uploadResponse.id;
            } else {
              // 처리할 파일이 없는 경우, 이 루프를 건너뜁니다.
              console.error(`'${doc.name}'에 대한 로컬 파일이 없어 업로드할 수 없습니다.`);
              setProcessingStatus(`'${doc.name}' 처리 실패 (원본 파일 없음).`);
              continue; // 다음 문서로 넘어감
            }
          }

          // 3. 최종적으로 확보된 ID로 실제 문서 처리를 요청합니다.
          if (!documentId) {
            throw new Error("문서 ID를 확보하지 못했습니다.");
          }

          setProcessingStatus(`'${doc.name}' (ID: ${documentId}) 처리 중...`);
          const processResponse = await createAndDownloadDocument(extractedText, documentId);

          // 4. 결과 처리 (기존과 동일)
          const url = window.URL.createObjectURL(new Blob([processResponse.data]));
          const newFileName = `(완료) ${doc.name.replace(/\.docx?$/, '')}.docx`;
          processedResults.push({
            fileName: newFileName,
            downloadUrl: url,
          });

        } catch (error) {
          console.error(`'${doc.name}' 처리 중 오류 발생:`, error);
          setProcessingStatus(`'${doc.name}' 처리 실패.`);
        }
      }

      setProcessedDocs(processedResults);
      setProcessingStatus(`총 ${processedResults.length}개의 문서 처리가 완료되었습니다.`);

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
          {/* --- 결과 표시 영역 --- */}
          {isLoading && <ProcessingStatus>{processingStatus}</ProcessingStatus>}
          {errors.length > 0 && errors.map((error, index) => <ErrorMessage key={index}>{error}</ErrorMessage>)}

          {/* [수정] 처리 완료 후 결과 목록 표시 */}
          {!isLoading && processedDocs.length > 0 && (
              <ResultsWrapper>
                <StepTitle as="h3" isCompleted={true} style={{ marginBottom: '24px' }}>처리 완료된 문서 목록</StepTitle>
                {processedDocs.map((doc, index) => (
                    <ResultItem key={index}>
                      <FileName>{doc.fileName}</FileName>
                      <DownloadButton href={doc.downloadUrl} download={doc.fileName}>
                        다운로드
                      </DownloadButton>
                    </ResultItem>
                ))}
              </ResultsWrapper>
          )}

          {!isLoading && errors.length === 0 && processedDocs.length === 0 && (
              <ResultsPlaceholder>
                <p>결과가 여기에 표시됩니다.</p>
              </ResultsPlaceholder>
          )}
        </OutputArea>
      </PageLayout>
  );
}

export default MainPage;
