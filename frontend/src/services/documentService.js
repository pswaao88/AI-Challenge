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

export const createAndDownloadDocument = async (extractedText, documentId) => {
  const formData = new FormData();

  // 백엔드 컨트롤러의 @RequestParam 이름과 정확히 일치시킵니다.
  formData.append('extractedText', extractedText);
  formData.append('documentId', documentId);

  return await apiClient.post('/document/create-and-download', formData, {
    responseType: 'blob', // 서버가 byte[]를 반환하므로 blob 타입으로 받습니다.
  });
};

// 1. 파일 이름으로 ID를 확인하는 API
export const findIdByName = async (fileName) => {
  const response = await apiClient.get('/document/find-by-name', {
    params: { fileName }
  });
  return response.data; // { id: 123 } 또는 {} 형태의 객체를 반환
};

// 2. 파일을 업로드하고 ID를 받는 API (기존의 업로드 로직 활용)
// 이 API는 파일을 업로드하고, 저장된 Document 객체(ID 포함)를 반환해야 합니다.
export const uploadFileAndGetId = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/document/upload', formData); // 기존 업로드 엔드포인트
  return response.data; // { id: 456, fileName: ... } 형태의 객체를 반환
};
