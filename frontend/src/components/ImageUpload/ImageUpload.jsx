import React, { useState, useRef } from 'react';
import styled from 'styled-components';

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

const UploadArea = styled.div`
  border: 2px dashed ${props => props.isDragOver ? '#007bff' : '#ddd'};
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${props => props.isDragOver ? '#f0f7ff' : 'white'};
  margin-bottom: 15px;

  &:hover {
    border-color: #007bff;
    background-color: #f0f7ff;
  }
`;

const UploadText = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.9rem;
`;

const ImageList = styled.div`
  max-height: 300px;
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

const ImageItem = styled.div`
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

const ImagePreview = styled.img`
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 10px;
  border: 1px solid #ddd;
`;

const ImageName = styled.span`
  flex: 1;
  font-size: 0.9rem;
  color: #444;
  margin-right: 30px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DeleteButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #ff4444;
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
  visibility: hidden;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #cc0000;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const ImageCount = styled.div`
  text-align: center;
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #666;
`;

function ImageUpload({ onFilesChange }) {
  const [images, setImages] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    const imageFiles = Array.from(files).filter(file =>
        file.type.startsWith('image/')
    );

    const newImages = imageFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      file: file,
      preview: URL.createObjectURL(file)
    }));

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    onFilesChange(updatedImages);
  };

  const handleFileInput = (e) => {
    handleFileSelect(e.target.files);
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDeleteImage = (imageId) => {
    const imageToDelete = images.find(img => img.id === imageId);
    if (imageToDelete && imageToDelete.preview) {
      URL.revokeObjectURL(imageToDelete.preview);
    }

    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);
    onFilesChange(updatedImages);
  };

  return (
      <Container>
        <Title>이미지 업로드</Title>
        <ImageCount>업로드된 이미지: {images.length}개</ImageCount>

        <UploadArea
            isDragOver={isDragOver}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
          <UploadText>
            이미지를 드래그하거나 클릭하여 업로드<br/>
            (JPG, PNG, GIF 등)
          </UploadText>
        </UploadArea>

        <ImageList>
          {images.map(image => (
              <ImageItem key={image.id}>
                <ImagePreview src={image.preview} alt={image.name} />
                <ImageName>{image.name}</ImageName>
                <DeleteButton
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(image.id);
                    }}
                >
                  ×
                </DeleteButton>
              </ImageItem>
          ))}
        </ImageList>

        <HiddenInput
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            accept="image/*"
            multiple
        />
      </Container>
  );
}

export default ImageUpload;
