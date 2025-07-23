package AI_Challenge.AI_Challenge.domain.document.entity;

import AI_Challenge.AI_Challenge.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class Document extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String originalFileName;    // 원본 파일명

    @Column(nullable = false)
    private String storedFileName;      // 저장된 파일명

    private String filePath;            // 파일 저장 경로

    private Long fileSize;              // 파일 크기

    private String fileType;            // 파일 타입

    @Builder
    public Document(String originalFileName, String storedFileName,
        String filePath, Long fileSize, String fileType) {
        this.originalFileName = originalFileName;
        this.storedFileName = storedFileName;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.fileType = fileType;
    }
}
