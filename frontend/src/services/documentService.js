import axios from 'axios';

// Axios 인스턴스 생성 (Base URL 설정)
const apiClient = axios.create({
  baseURL: '/api', // 프록시 설정으로 백엔드 연결
  timeout: 60000, // 60초 타임아웃
});

// 요청/응답 인터셉터 (에러 처리)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API 에러:', error);
      if (error.response?.status === 500) {
        console.error('서버 내부 에러');
      }
      return Promise.reject(error);
    }
);

// 문서 업로드
export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return await apiClient.post('/document/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 모든 문서 조회
export const fetchDocuments = async () => {
  return await apiClient.get('/document/list');
};

// 문서 처리 및 다운로드
export const processAndDownloadDocument = async (documentId, fileName, isFromDb = true) => {
  return await apiClient.post('/document/process-and-download', {
    documentId,
    fileName,
    isFromDb,
  }, {
    responseType: 'blob', // 파일 다운로드를 위한 blob 타입
  });
};

// 처리된 문서 목록 조회
export const fetchProcessedDocuments = async () => {
  return await apiClient.get('/document/processed-list');
};

// 처리된 문서 다운로드
export const downloadProcessedDocument = async (fileName) => {
  return await apiClient.post('/document/download-processed', {
    fileName,
  }, {
    responseType: 'blob',
  });
};

// Gemini API로 이미지 처리
export const processImageWithGemini = async (images) => {
  const formData = new FormData();
  formData.append('prompt', prompt);

  images.forEach(image => {
    formData.append('images', image.file);
  });

  return await apiClient.post('/gemini/generate/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const createAndDownloadDocument = async (extractedText, documentFile) => {
  // ==================== 최종 디버깅 단계 ====================
  console.log("API 함수가 전달받은 값:", {
    text: extractedText,
    file: documentFile
  });

  // 1. documentFile 변수가 아예 없는 경우 (undefined, null)
  if (!documentFile) {
    console.error("치명적 오류: documentFile 변수가 비어있습니다! API 호출을 중단합니다.");
    // 에러를 발생시켜 상위의 catch 블록으로 이동시킵니다.
    throw new Error("파일 데이터가 존재하지 않습니다. handleProcessDocs 함수를 확인해주세요.");
  }

  // 2. documentFile 변수가 실제 파일(File 객체)이 아닌 경우
  if (!(documentFile instanceof File)) {
    console.error("치명적 오류: 전달된 documentFile이 실제 파일 객체가 아닙니다!", documentFile);
    throw new Error("전달된 데이터가 유효한 파일이 아닙니다. File 객체를 전달해야 합니다.");
  }
  // ==========================================================

  const formData = new FormData();

  // 백엔드 컨트롤러의 @RequestParam 이름과 정확히 일치시켜야 합니다.
  formData.append('extractedText', extractedText);
  formData.append('documentFile', documentFile);

  return await apiClient.post('/document/create-and-download', formData, {
    responseType: 'blob', // 서버가 byte[]를 반환하므로 blob 타입으로 받습니다.
  });
};
