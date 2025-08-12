// src/components/DocSelector/DocSelector.jsx
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { fetchDocuments } from '../../services/documentService';

// [수정] Container를 flexbox 레이아웃으로 변경하여 내부 요소 제어
const Container = styled.div`
  width: 100%;
  height: 100%; /* 부모(StepContent)의 높이를 100% 사용 */
  background-color: #f8f8f8;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
`;

// [삭제] 사용하지 않는 Title 컴포넌트 제거

// [수정] DocList가 남은 공간을 모두 차지하고 스크롤되도록 변경
const DocList = styled.div`
  flex: 1; /* 핵심: 남은 수직 공간을 모두 차지 */
  min-height: 0; /* flex 자식 요소의 스크롤을 위해 필요 */
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
  position: relative;

  &:hover {
    background: #f0f7ff;
    .delete-button {
      opacity: 1;
      visibility: visible;
    }
  }
`;

const DeleteButton = styled.button`
  /* position, top, right 속성 제거 */
  background-color: rgba(3, 78, 162, 1);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;

  margin-left: 12px; /* 파일 이름과의 간격을 위해 추가 */
  flex-shrink: 0;    /* 버튼 크기가 줄어들지 않도록 설정 */

  &:hover {
    background-color: rgba(0, 0, 0, 0.9);
  }

  ${DocItem}:hover & {
    opacity: 1;
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

// [수정] UploadSection이 줄어들지 않도록 설정
const UploadSection = styled.div`
  border-top: 1px solid #ddd;
  padding-top: 15px;
  flex-shrink: 0; /* 버튼 영역이 줄어드는 것을 방지 */
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
  flex-shrink: 0; /* 카운트 영역이 줄어드는 것을 방지 */
`;

const HiddenInput = styled.input`
  display: none;
`;

function DocSelector({ onDocsSelect }) {
  const [docs, setDocs] = useState([]);
  const [dbDocs, setDbDocs] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState(new Set());
  const fileInputRef = useRef(null);

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

  // onDocsSelect가 변경될 때마다 호출되지 않도록 수정
  const onDocsSelectRef = useRef(onDocsSelect);
  onDocsSelectRef.current = onDocsSelect;

  useEffect(() => {
    const selectedDocsList = [
      ...docs.filter(doc => selectedDocs.has(doc.id)),
      ...dbDocs.filter(doc => selectedDocs.has(doc.id))
    ];
    onDocsSelectRef.current(selectedDocsList);
  }, [selectedDocs, docs, dbDocs]);

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

  const handleDeleteDoc = (docId) => {
    setDocs(prevDocs => prevDocs.filter(doc => doc.id !== docId));
    setSelectedDocs(prevSelected => {
      const newSelected = new Set(prevSelected);
      newSelected.delete(docId);
      return newSelected;
    });
  };

  return (
      <Container>
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
                <DeleteButton
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDoc(doc.id);
                    }}
                >
                  삭제
                </DeleteButton>
              </DocItem>
          ))}
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
              accept=".doc,.docx"
              multiple
          />
        </UploadSection>
      </Container>
  );
}

export default DocSelector;
