// Nginx가 /api로 프록시하므로 상대 경로 사용
export const API_BASE_URL = '/api';

// axios 인스턴스 생성 (선택적)
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
