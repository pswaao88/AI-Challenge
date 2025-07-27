// src/components/DocSelector/DocSelector.jsx
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { fetchDocuments } from '../../services/documentService';

const Container = styled.div`
  width: 100%;
  min-width: 250px;
  background-color: #f8f8f8;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Title = styled.h3`
  margin-bottom: 15px;
  color: #333;
  font-size: 1.1rem;
  text-align: center;
`;

const DocList = styled.div`
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 15px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }
`;

const DocItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  margin-bottom: 8px;
  background: white;
  border-radius: 4px;
  border: 1px solid #ddd;
  
  &:hover {
    background: #f0f7ff;
  }
`;

const Checkbox = styled.input`
  margin-right: 10px;
  cursor: pointer;
  width: 16px;
  height: 16px;
`;

const DocName = styled.span`
  flex: 1;
  font-size: 0.9rem;
  color: #444;
`;

const UploadSection = styled.div`
  border-top: 1px solid #ddd;
  padding-top: 15px;
  margin-top: 15px;
`;

const UploadButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  width: 100%;
  font-size: 0.9rem;
  
  &:hover {
    background-color: #218838;
  }
`;

const SelectedCount = styled.div`
  text-align: center;
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #666;
`;

const HiddenInput = styled.input`
  display: none;
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #666;
  padding: 20px;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  text-align: center;
  padding: 10px;
  margin: 10px 0;
`;

function DocSelector({ onDocsSelect }) {
  const [docs, setDocs] = useState([]);
  const [dbDocs, setDbDocs] = useState([]); // DB 문서 목록 추가
  const [selectedDocs, setSelectedDocs] = useState(new Set());
  const fileInputRef = useRef(null);

  // DB 문서 목록 로드
  useEffect(() => {
    loadDbDocuments();
  }, []);

  const loadDbDocuments = async () => {
    try {
      const response = await fetchDocuments();
      setDbDocs(response.data);
    } catch (err) {
      console.error('DB 문서 목록 로딩 에러:', err);
    }
  };

  const handleDocSelect = (docId) => {
    setSelectedDocs(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(docId)) {
        newSelected.delete(docId);
      } else {
        newSelected.add(docId);
      }
      return newSelected;
    });
  };

  useEffect(() => {
    const selectedDocsList = [
      ...docs.filter(doc => selectedDocs.has(doc.id)),
      ...dbDocs.filter(doc => selectedDocs.has(doc.id))
    ];
    onDocsSelect(selectedDocsList);
  }, [selectedDocs, docs, dbDocs, onDocsSelect]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newDocs = files.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        file: file
      }));

      setDocs(prevDocs => [...prevDocs, ...newDocs]);
    }
    e.target.value = '';
  };

  return (
      <Container>
        <Title>문서 템플릿 선택</Title>
        <SelectedCount>
          선택된 문서: {selectedDocs.size}개
        </SelectedCount>

        <DocList>
          {/* 업로드된 문서 목록 */}
          {docs.map(doc => (
              <DocItem key={doc.id}>
                <Checkbox
                    type="checkbox"
                    checked={selectedDocs.has(doc.id)}
                    onChange={() => handleDocSelect(doc.id)}
                />
                <DocName>{doc.name}</DocName>
              </DocItem>
          ))}

          {/* DB 문서 목록 */}
          {dbDocs.map(doc => (
              <DocItem key={`db-${doc.id}`}>
                <Checkbox
                    type="checkbox"
                    checked={selectedDocs.has(doc.id)}
                    onChange={() => handleDocSelect(doc.id)}
                />
                <DocName>{doc.fileName} (DB)</DocName>
              </DocItem>
          ))}
        </DocList>

        <UploadSection>
          <UploadButton onClick={() => fileInputRef.current.click()}>
            새 문서 템플릿 추가
          </UploadButton>
          <HiddenInput
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".doc,.docx,.pdf"
              multiple
          />
        </UploadSection>
      </Container>
  );
}

export default DocSelector;
