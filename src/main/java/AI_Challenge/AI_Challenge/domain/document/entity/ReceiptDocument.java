package AI_Challenge.AI_Challenge.domain.document.entity;

import AI_Challenge.AI_Challenge.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class ReceiptDocument extends BaseTimeEntity {

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

    private boolean processed; // 처리 상태 추가

    @Builder
    public ReceiptDocument(String originalFileName, String storedFileName,
                         String filePath, Long fileSize, String fileType) {
        this.originalFileName = originalFileName;
        this.storedFileName = storedFileName;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.fileType = fileType;
        this.processed = false;
    }

    public void markAsProcessed() {
        this.processed = true;
    }
}
