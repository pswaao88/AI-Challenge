package AI_Challenge.AI_Challenge.domain.document.entity;

import AI_Challenge.AI_Challenge.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class TemplateDocument extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String originalFileName;

    @Column(nullable = false)
    private String storedFileName;

    private String filePath;

    private Long fileSize;

    private String fileType;

    private boolean isDB; // DB 템플릿 여부

    @Builder
    public TemplateDocument(String originalFileName, String storedFileName,
                          String filePath, Long fileSize, String fileType, boolean isDB) {
        this.originalFileName = originalFileName;
        this.storedFileName = storedFileName;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.fileType = fileType;
        this.isDB = isDB;
    }
}
