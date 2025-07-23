import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
instance.interceptors.request.use(
    (config) => {
      // 요청 전 처리 (예: 토큰 추가)
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

// 응답 인터셉터
instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // 에러 처리
      return Promise.reject(error);
    }
);

export default instance;
