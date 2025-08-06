
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

const ImageList = styled.div`
  width: 250px;
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 5px;
`;

const ImageItem = styled.div`
  position: relative;
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: contain;
  border-radius: 8px;
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

  ${ImageItem}:hover & {
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


function ImageUpload({ onFilesChange }) {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
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
      return;
    }
    processFiles(imageFiles);
  };

  const processFiles = (files) => {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          url: e.target.result,
          name: file.name,
          file: file
        };
        setImages(prevImages => [newImage, ...prevImages]);
        if (onFilesChange) {
          onFilesChange(prev => [newImage, ...prev]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
    e.target.value = '';
  };

  const handleDeleteImage = (imageId) => {
    setImages(prevImages => {
      const newImages = prevImages.filter(image => image.id !== imageId);
      if (onFilesChange) {
        onFilesChange(newImages);
      }
      return newImages;
    });
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
      <Container>
        <UploadContainer
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
          <UploadText>이미지를 드래그하거나<br/>버튼을 클릭하세요</UploadText>
          <UploadButton onClick={handleUploadClick}>
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
                    <PreviewImage
                        src={image.url}
                        alt={image.name}
                        onClick={() => handleImageClick(image)}
                        style={{ cursor: 'pointer' }}
                    />
                    <DeleteButton
                        onClick={() => handleDeleteImage(image.id)}
                    >
                      ×
                    </DeleteButton>
                  </ImageItem>
              ))}
            </ImageList>
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
