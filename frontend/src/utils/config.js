import axios from 'axios'; // axios 임포트

// Nginx가 /api 경로로 들어오는 요청을 백엔드로 프록시하므로,
// 프론트엔드에서는 상대 경로인 '/api'를 기본 API URL로 사용합니다.
// 이 변수 선언은 import 문 뒤에 와야 합니다.
export const API_BASE_URL = '/api';

// axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 파일 업로드 설정
export const FILE_UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedDocumentTypes: ['.doc', '.docx', '.pdf'],
};

// UI 설정
export const UI_CONFIG = {
  maxItemsPerPage: 20,
  debounceDelay: 300,
  animationDuration: 300,
};


export const APP_NAME = "AI Challenge Frontend";
export const VERSION = "1.0.0";

