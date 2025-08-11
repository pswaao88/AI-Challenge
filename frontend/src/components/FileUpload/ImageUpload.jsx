import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

// --- 기존 스타일 컴포넌트는 대부분 그대로 사용합니다 ---
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const UploadContainer = styled.div`
  width: 250px;
  height: 200px;
  border: 2px dashed #cccccc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;
  position: relative;
  margin-bottom: 20px;
  padding: 15px;

  &:hover {
    border-color: #666666;
    cursor: pointer;
  }
`;

const UploadText = styled.div`
  text-align: center;
  color: #666;
  margin-bottom: 10px;
`;

const UploadButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  width: 200px;

  &:hover {
    background-color: #0056b3;
    transform: translateY(-1px);
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const FileList = styled.div`
  width: 250px;
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 5px;
`;

const FileItem = styled.div`
  position: relative;
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: contain;
  border-radius: 8px;
`;

// PDF 미리보기를 위한 새로운 스타일 컴포넌트
const PdfPreview = styled.div`
  width: 100%;
  height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #e9e9e9;
  border-radius: 8px;
  padding: 10px;
  box-sizing: border-box;
`;

const PdfIcon = styled.span`
  font-size: 48px;
`;

const FileName = styled.p`
  font-size: 14px;
  color: #333;
  word-break: break-all;
  text-align: center;
  margin-top: 10px;
`;


const DeleteButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(255, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;

  &:hover {
    background-color: rgba(255, 0, 0, 0.9);
  }

  ${FileItem}:hover & {
    opacity: 1;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalImage = styled.img`
  max-width: 90%;
  max-height: 90vh;
  object-fit: contain;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #e0e0e0;
  }
`;

// --- 로직이 수정된 ImageUpload 컴포넌트 ---
function ImageUpload({ onFilesChange }) {
  // 'images' -> 'files'로 상태 이름 변경
  const [files, setFiles] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  // 컴포넌트 언마운트 시 Blob URL 메모리 해제
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.type === 'pdf') {
          URL.revokeObjectURL(file.url);
        }
      });
    };
  }, [files]);


  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFiles = (incomingFiles) => {
    // 이미지와 PDF 파일만 허용하도록 필터링 로직 수정
    const allowedFiles = incomingFiles.filter(
        file => file.type.startsWith('image/') || file.type === 'application/pdf'
    );

    if (allowedFiles.length !== incomingFiles.length) {
      alert('이미지 또는 PDF 파일만 업로드 가능합니다.');
    }

    if(allowedFiles.length > 0) {
      processFiles(allowedFiles);
    }
  };

  const processFiles = (newFiles) => {
    const processedFiles = newFiles.map(file => {
      const isImage = file.type.startsWith('image/');
      // 이미지면 Data URL, PDF면 Blob URL 생성
      const fileUrl = isImage ? URL.createObjectURL(file) : URL.createObjectURL(file);

      return {
        id: Date.now() + Math.random(),
        url: fileUrl,
        name: file.name,
        file: file,
        type: isImage ? 'image' : 'pdf'
      };
    });

    setFiles(prevFiles => [...processedFiles, ...prevFiles]);
    if (onFilesChange) {
      onFilesChange(prev => [...processedFiles, ...prev]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
    e.target.value = '';
  };

  const handleDeleteFile = (fileId) => {
    setFiles(prevFiles => {
      // 삭제할 파일 찾기
      const fileToDelete = prevFiles.find(file => file.id === fileId);
      if (fileToDelete && fileToDelete.type === 'pdf') {
        // PDF의 경우 메모리 누수 방지를 위해 Blob URL 해제
        URL.revokeObjectURL(fileToDelete.url);
      }

      const newFiles = prevFiles.filter(file => file.id !== fileId);
      if (onFilesChange) {
        onFilesChange(newFiles);
      }
      return newFiles;
    });
  };

  // 이미지와 PDF 클릭 이벤트를 다르게 처리
  const handleItemClick = (file) => {
    if (file.type === 'image') {
      setSelectedImage(file);
    } else { // PDF인 경우 새 탭에서 열기
      window.open(file.url, '_blank');
    }
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
      <Container>
        <UploadContainer onDragOver={handleDragOver} onDrop={handleDrop}>
          <UploadText>이미지 또는 PDF를 드래그하거나<br/>버튼을 클릭하세요</UploadText>
          <UploadButton onClick={handleUploadClick}>
            + 파일 업로드
          </UploadButton>
          <HiddenInput
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              // accept 속성에 PDF 추가
              accept="image/*,application/pdf"
              multiple
          />
        </UploadContainer>

        {files.length > 0 && (
            // ImageList -> FileList로 이름 변경
            <FileList>
              {files.map((file) => (
                  // ImageItem -> FileItem으로 이름 변경
                  <FileItem key={file.id}>
                    {file.type === 'image' ? (
                        <PreviewImage
                            src={file.url}
                            alt={file.name}
                            onClick={() => handleItemClick(file)}
                        />
                    ) : (
                        <PdfPreview onClick={() => handleItemClick(file)}>
                          <PdfIcon>📄</PdfIcon>
                          <FileName>{file.name}</FileName>
                        </PdfPreview>
                    )}
                    <DeleteButton onClick={(e) => {
                      e.stopPropagation(); // 부모 요소의 클릭 이벤트 방지
                      handleDeleteFile(file.id);
                    }}>
                      ×
                    </DeleteButton>
                  </FileItem>
              ))}
            </FileList>
        )}

        {selectedImage && (
            <Modal onClick={closeModal}>
              <ModalImage
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  onClick={(e) => e.stopPropagation()}
              />
              <CloseButton onClick={closeModal}>×</CloseButton>
            </Modal>
        )}
      </Container>
  );
}

export default ImageUpload;
