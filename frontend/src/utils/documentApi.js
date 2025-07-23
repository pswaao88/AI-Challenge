import axios from './axiosInstance';

// 문서 목록 조회
export const fetchDocuments = () => {
  return axios.get('/api/documents');
};

// 새 문서 업로드
export const uploadDocument = (formData) => {
  return axios.post('/api/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 선택된 문서 처리
export const processDocuments = (documentIds) => {
  return axios.post('/api/documents/process', { documentIds });
};
