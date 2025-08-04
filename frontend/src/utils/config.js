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


export const APP_NAME = "AI Challenge Frontend";
export const VERSION = "1.0.0";

