package AI_Challenge.AI_Challenge.domain.document.dto;

import AI_Challenge.AI_Challenge.domain.document.entity.Document;
import lombok.Getter;

@Getter
public class DocumentResponseDto {
    private Long id;
    private String originalFileName;
    private String fileType;
    private Long fileSize;
    private String filePath;

    public DocumentResponseDto(Document document) {
        this.id = document.getId();
        this.originalFileName = document.getOriginalFileName();
        this.fileType = document.getFileType();
        this.fileSize = document.getFileSize();
        this.filePath = document.getFilePath();
    }
}
