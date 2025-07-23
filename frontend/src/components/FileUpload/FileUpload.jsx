// src/components/FileUpload/FileUpload.jsx
import React, { useState, useRef } from 'react';
import styled from 'styled-components';

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

const ImageList = styled.div`
  width: 250px;
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 5px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }
`;

const ImageItem = styled.div`
  position: relative;
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  background-color: white;

  &:hover .delete-button {
    opacity: 1;
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: contain;
  border-radius: 8px;
`;

const UploadButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  margin-top: 10px;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: #0056b3;
    transform: translateY(-1px);
  }
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
`;

const HiddenInput = styled.input`
  display: none;
`;

const UploadText = styled.div`
  text-align: center;
  color: #666;
  margin-bottom: 10px;
`;

function FileUpload() {
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length !== files.length) {
      alert('이미지 파일만 업로드 가능합니다.');
    }

    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prevImages => [{
          id: Date.now() + Math.random(),
          url: e.target.result,
          name: file.name
        }, ...prevImages]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
    e.target.value = ''; // 입력 초기화
  };

  const handleDeleteImage = (imageId) => {
    setImages(prevImages => prevImages.filter(image => image.id !== imageId));
  };

  return (
      <Container>
        <UploadContainer
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
          <UploadText>영수증 이미지를 드래그하거나<br/>버튼을 클릭하세요</UploadText>
          <UploadButton onClick={handleButtonClick}>
            + 이미지 업로드
          </UploadButton>
          <HiddenInput
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              accept="image/*"
              multiple
          />
        </UploadContainer>

        {images.length > 0 && (
            <ImageList>
              {images.map((image) => (
                  <ImageItem key={image.id}>
                    <PreviewImage src={image.url} alt={image.name} />
                    <DeleteButton
                        className="delete-button"
                        onClick={() => handleDeleteImage(image.id)}
                    >
                      ×
                    </DeleteButton>
                  </ImageItem>
              ))}
            </ImageList>
        )}
      </Container>
  );
}

export default FileUpload;
