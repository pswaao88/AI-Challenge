// src/components/DocSelector/DocSelector.jsx
import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 300px;
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
  max-height: 250px;
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

const Badge = styled.span`
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 0.8rem;
  margin-left: 8px;
`;

const DBBadge = styled(Badge)`
  background-color: #e9ecef;
  color: #666;
`;

const UploadedBadge = styled(Badge)`
  background-color: #d4edda;
  color: #28a745;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;

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

// 임시 더미 데이터
const initialDocs = [
  { id: 1, name: '표준 근로계약서.doc', isDB: true },
  { id: 2, name: '업무 위임장.doc', isDB: true },
  { id: 3, name: '급여 명세서.doc', isDB: true },
];

function DocSelector() {
  const [docs, setDocs] = useState(initialDocs);
  const [selectedDocs, setSelectedDocs] = useState(new Set());
  const fileInputRef = React.useRef(null);

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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validExtensions = ['.doc', '.docx', '.pdf'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        alert('doc, docx, pdf 파일만 업로드 가능합니다.');
        return;
      }

      const newDoc = {
        id: Date.now(),
        name: file.name,
        isDB: false,
        file: file
      };

      setDocs(prevDocs => [...prevDocs, newDoc]);
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
        {docs.map(doc => (
          <DocItem key={doc.id}>
            <Checkbox
              type="checkbox"
              checked={selectedDocs.has(doc.id)}
              onChange={() => handleDocSelect(doc.id)}
            />
            <DocName>{doc.name}</DocName>
            {doc.isDB ? (
              <DBBadge>DB</DBBadge>
            ) : (
              <UploadedBadge>추가됨</UploadedBadge>
            )}
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
        />
      </UploadSection>
    </Container>
  );
}

export default DocSelector;
